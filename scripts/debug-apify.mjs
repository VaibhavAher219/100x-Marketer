#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import dotenv from 'dotenv'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const APIFY_TOKEN = process.env.APIFY_TOKEN
if (!APIFY_TOKEN) {
  console.error('❌ Missing APIFY_TOKEN in .env.local')
  process.exit(1)
}

console.log('🔍 Testing Apify Indeed API...\n')

async function testApifyAPI() {
  const endpoint = `https://api.apify.com/v2/acts/borderline~indeed-scraper/run-sync-get-dataset-items?token=${encodeURIComponent(APIFY_TOKEN)}`
  
  const payload = {
    country: 'us',
    fromDays: '3',
    maxRows: 10,
    maxRowsPerUrl: 10,
    query: 'Growth Marketing',
    urls: [
      'https://www.indeed.com/jobs?q=Growth+Marketing+Manager&l=Remote&fromage=7&sc=0kf%3Aattr%28DSQF7%29%3B&from=searchOnDesktopSerp&vjk=9c9039e535541977'
    ]
  }

  console.log('📤 Request payload:')
  console.log(JSON.stringify(payload, null, 2))
  console.log('\n⏳ Calling Apify API...')

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })

    console.log(`📊 Response status: ${response.status} ${response.statusText}`)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ API Error:', errorText)
      return null
    }

    const data = await response.json()
    
    // Save full response for analysis
    const outputFile = path.resolve(process.cwd(), 'apify-response-sample.json')
    fs.writeFileSync(outputFile, JSON.stringify(data, null, 2))
    console.log(`💾 Full response saved to: ${outputFile}`)
    
    console.log(`\n📈 Response summary:`)
    console.log(`- Type: ${Array.isArray(data) ? 'Array' : typeof data}`)
    console.log(`- Items count: ${Array.isArray(data) ? data.length : 'N/A'}`)
    
    if (Array.isArray(data) && data.length > 0) {
      console.log('\n🔍 First item structure:')
      const firstItem = data[0]
      const fields = Object.keys(firstItem)
      
      fields.forEach(field => {
        const value = firstItem[field]
        const type = typeof value
        const preview = type === 'string' && value.length > 50 
          ? value.substring(0, 50) + '...' 
          : JSON.stringify(value)
        console.log(`  ${field}: ${type} = ${preview}`)
      })
      
      // Analyze field mapping
      console.log('\n🗺️  Field mapping analysis:')
      analyzeFieldMapping(firstItem)
    }
    
    return data
  } catch (error) {
    console.error('❌ Request failed:', error.message)
    return null
  }
}

function analyzeFieldMapping(item) {
  const mappings = [
    { our: 'title', their: ['title', 'jobTitle', 'positionName'] },
    { our: 'company_name', their: ['companyName', 'company', 'employer'] },
    { our: 'location', their: ['location', 'jobLocation', 'city'] },
    { our: 'is_remote', their: ['isRemote', 'remote', 'remoteWork'] },
    { our: 'job_type', their: ['jobType', 'employmentType', 'type'] },
    { our: 'description', their: ['descriptionText', 'description', 'jobDescription'] },
    { our: 'description_html', their: ['descriptionHtml', 'descriptionHTML'] },
    { our: 'salary_min', their: ['salary.salaryMin', 'minSalary', 'salaryFrom'] },
    { our: 'salary_max', their: ['salary.salaryMax', 'maxSalary', 'salaryTo'] },
    { our: 'apply_url', their: ['applyUrl', 'applicationUrl', 'jobUrl'] },
    { our: 'job_url', their: ['jobUrl', 'url', 'link'] },
    { our: 'external_id', their: ['jobKey', 'id', 'jobId'] },
    { our: 'posted_at', their: ['datePublished', 'postedDate', 'publishedDate'] }
  ]
  
  mappings.forEach(({ our, their }) => {
    const found = their.find(field => {
      if (field.includes('.')) {
        const [parent, child] = field.split('.')
        return item[parent] && item[parent][child] !== undefined
      }
      return item[field] !== undefined
    })
    
    if (found) {
      let value = item[found]
      if (found.includes('.')) {
        const [parent, child] = found.split('.')
        value = item[parent][child]
      }
      console.log(`  ✅ ${our} -> ${found} (${typeof value})`)
    } else {
      console.log(`  ❌ ${our} -> NO MATCH (tried: ${their.join(', ')})`)
    }
  })
}

// Test database connection
async function testDatabaseConnection() {
  const dbUrl = process.env.SUPABASE_DB_URL
  if (!dbUrl) {
    console.log('⚠️  SUPABASE_DB_URL not found, skipping DB test')
    return false
  }
  
  console.log('\n🗄️  Testing database connection...')
  
  try {
    const { default: pg } = await import('pg')
    const client = new pg.Client({ connectionString: dbUrl })
    await client.connect()
    
    // Check if external_jobs table exists
    const { rows } = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'external_jobs' 
      ORDER BY ordinal_position
    `)
    
    if (rows.length === 0) {
      console.log('❌ external_jobs table not found')
      await client.end()
      return false
    }
    
    console.log('✅ Database connection successful')
    console.log('📋 external_jobs table columns:')
    rows.forEach(row => {
      console.log(`  ${row.column_name}: ${row.data_type}`)
    })
    
    await client.end()
    return true
  } catch (error) {
    console.log('❌ Database connection failed:', error.message)
    return false
  }
}

// Main execution
async function main() {
  // Test API
  const apiData = await testApifyAPI()
  
  if (!apiData) {
    console.log('\n❌ API test failed, cannot proceed')
    process.exit(1)
  }
  
  // Test database
  const dbOk = await testDatabaseConnection()
  
  // Generate updated mapper if needed
  if (Array.isArray(apiData) && apiData.length > 0) {
    console.log('\n🔧 Generating updated mapper...')
    generateUpdatedMapper(apiData[0])
  }
  
  console.log('\n✅ Debug complete!')
  console.log('📁 Check apify-response-sample.json for full API response')
  
  if (dbOk && apiData && Array.isArray(apiData) && apiData.length > 0) {
    console.log('\n🚀 Ready to test ingestion pipeline!')
    console.log('Run: npm run migrate:run && curl -X POST http://localhost:3000/api/ingest/apify')
  }
}

function generateUpdatedMapper(sampleItem) {
  const fields = Object.keys(sampleItem)
  
  console.log('📝 Suggested mapper updates based on actual response:')
  console.log(`
static mapIndeed(item) {
  return {
    source: 'indeed',
    external_id: item.jobKey || item.id || item.jobUrl || '',
    title: item.title || 'Untitled',
    company_name: item.companyName || null,
    company_url: item.companyUrl || null,
    company_logo_url: item.companyLogoUrl || null,
    location: typeof item.location === 'object' 
      ? (item.location?.formattedAddressShort || item.location?.city) 
      : item.location || null,
    is_remote: !!item.isRemote,
    job_type: Array.isArray(item.jobType) ? item.jobType.join(',') : (item.jobType || null),
    salary_min: item.salary?.salaryMin || null,
    salary_max: item.salary?.salaryMax || null,
    salary_currency: item.salary?.salaryCurrency || 'USD',
    compensation: null,
    experience_level: null,
    category: null,
    skills: [],
    description: item.descriptionText || item.description || null,
    description_html: item.descriptionHtml || null,
    apply_url: item.applyUrl || item.jobUrl || null,
    job_url: item.jobUrl || null,
    posted_at: item.datePublished ? new Date(item.datePublished).toISOString() : null,
    raw: item,
  }
}`)
  
  console.log('\n🔍 Available fields in response:')
  fields.forEach(field => {
    const value = sampleItem[field]
    const type = typeof value
    console.log(`  ${field}: ${type}`)
  })
}

main().catch(console.error)

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import dotenv from 'dotenv'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const APIFY_TOKEN = process.env.APIFY_TOKEN
if (!APIFY_TOKEN) {
  console.error('❌ Missing APIFY_TOKEN in .env.local')
  process.exit(1)
}

console.log('🔍 Testing Apify Indeed API...\n')

async function testApifyAPI() {
  const endpoint = `https://api.apify.com/v2/acts/borderline~indeed-scraper/run-sync-get-dataset-items?token=${encodeURIComponent(APIFY_TOKEN)}`
  
  const payload = {
    country: 'us',
    fromDays: '3',
    maxRows: 10,
    maxRowsPerUrl: 10,
    query: 'Growth Marketing',
    urls: [
      'https://www.indeed.com/jobs?q=Growth+Marketing+Manager&l=Remote&fromage=7&sc=0kf%3Aattr%28DSQF7%29%3B&from=searchOnDesktopSerp&vjk=9c9039e535541977'
    ]
  }

  console.log('📤 Request payload:')
  console.log(JSON.stringify(payload, null, 2))
  console.log('\n⏳ Calling Apify API...')

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })

    console.log(`📊 Response status: ${response.status} ${response.statusText}`)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ API Error:', errorText)
      return null
    }

    const data = await response.json()
    
    // Save full response for analysis
    const outputFile = path.resolve(process.cwd(), 'apify-response-sample.json')
    fs.writeFileSync(outputFile, JSON.stringify(data, null, 2))
    console.log(`💾 Full response saved to: ${outputFile}`)
    
    console.log(`\n📈 Response summary:`)
    console.log(`- Type: ${Array.isArray(data) ? 'Array' : typeof data}`)
    console.log(`- Items count: ${Array.isArray(data) ? data.length : 'N/A'}`)
    
    if (Array.isArray(data) && data.length > 0) {
      console.log('\n🔍 First item structure:')
      const firstItem = data[0]
      const fields = Object.keys(firstItem)
      
      fields.forEach(field => {
        const value = firstItem[field]
        const type = typeof value
        const preview = type === 'string' && value.length > 50 
          ? value.substring(0, 50) + '...' 
          : JSON.stringify(value)
        console.log(`  ${field}: ${type} = ${preview}`)
      })
      
      // Analyze field mapping
      console.log('\n🗺️  Field mapping analysis:')
      analyzeFieldMapping(firstItem)
    }
    
    return data
  } catch (error) {
    console.error('❌ Request failed:', error.message)
    return null
  }
}

function analyzeFieldMapping(item) {
  const mappings = [
    { our: 'title', their: ['title', 'jobTitle', 'positionName'] },
    { our: 'company_name', their: ['companyName', 'company', 'employer'] },
    { our: 'location', their: ['location', 'jobLocation', 'city'] },
    { our: 'is_remote', their: ['isRemote', 'remote', 'remoteWork'] },
    { our: 'job_type', their: ['jobType', 'employmentType', 'type'] },
    { our: 'description', their: ['descriptionText', 'description', 'jobDescription'] },
    { our: 'description_html', their: ['descriptionHtml', 'descriptionHTML'] },
    { our: 'salary_min', their: ['salary.salaryMin', 'minSalary', 'salaryFrom'] },
    { our: 'salary_max', their: ['salary.salaryMax', 'maxSalary', 'salaryTo'] },
    { our: 'apply_url', their: ['applyUrl', 'applicationUrl', 'jobUrl'] },
    { our: 'job_url', their: ['jobUrl', 'url', 'link'] },
    { our: 'external_id', their: ['jobKey', 'id', 'jobId'] },
    { our: 'posted_at', their: ['datePublished', 'postedDate', 'publishedDate'] }
  ]
  
  mappings.forEach(({ our, their }) => {
    const found = their.find(field => {
      if (field.includes('.')) {
        const [parent, child] = field.split('.')
        return item[parent] && item[parent][child] !== undefined
      }
      return item[field] !== undefined
    })
    
    if (found) {
      let value = item[found]
      if (found.includes('.')) {
        const [parent, child] = found.split('.')
        value = item[parent][child]
      }
      console.log(`  ✅ ${our} -> ${found} (${typeof value})`)
    } else {
      console.log(`  ❌ ${our} -> NO MATCH (tried: ${their.join(', ')})`)
    }
  })
}

// Test database connection
async function testDatabaseConnection() {
  const dbUrl = process.env.SUPABASE_DB_URL
  if (!dbUrl) {
    console.log('⚠️  SUPABASE_DB_URL not found, skipping DB test')
    return false
  }
  
  console.log('\n🗄️  Testing database connection...')
  
  try {
    const { default: pg } = await import('pg')
    const client = new pg.Client({ connectionString: dbUrl })
    await client.connect()
    
    // Check if external_jobs table exists
    const { rows } = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'external_jobs' 
      ORDER BY ordinal_position
    `)
    
    if (rows.length === 0) {
      console.log('❌ external_jobs table not found')
      await client.end()
      return false
    }
    
    console.log('✅ Database connection successful')
    console.log('📋 external_jobs table columns:')
    rows.forEach(row => {
      console.log(`  ${row.column_name}: ${row.data_type}`)
    })
    
    await client.end()
    return true
  } catch (error) {
    console.log('❌ Database connection failed:', error.message)
    return false
  }
}

// Main execution
async function main() {
  // Test API
  const apiData = await testApifyAPI()
  
  if (!apiData) {
    console.log('\n❌ API test failed, cannot proceed')
    process.exit(1)
  }
  
  // Test database
  const dbOk = await testDatabaseConnection()
  
  // Generate updated mapper if needed
  if (Array.isArray(apiData) && apiData.length > 0) {
    console.log('\n🔧 Generating updated mapper...')
    generateUpdatedMapper(apiData[0])
  }
  
  console.log('\n✅ Debug complete!')
  console.log('📁 Check apify-response-sample.json for full API response')
  
  if (dbOk && apiData && Array.isArray(apiData) && apiData.length > 0) {
    console.log('\n🚀 Ready to test ingestion pipeline!')
    console.log('Run: npm run migrate:run && curl -X POST http://localhost:3000/api/ingest/apify')
  }
}

function generateUpdatedMapper(sampleItem) {
  const fields = Object.keys(sampleItem)
  
  console.log('📝 Suggested mapper updates based on actual response:')
  console.log(`
static mapIndeed(item) {
  return {
    source: 'indeed',
    external_id: item.jobKey || item.id || item.jobUrl || '',
    title: item.title || 'Untitled',
    company_name: item.companyName || null,
    company_url: item.companyUrl || null,
    company_logo_url: item.companyLogoUrl || null,
    location: typeof item.location === 'object' 
      ? (item.location?.formattedAddressShort || item.location?.city) 
      : item.location || null,
    is_remote: !!item.isRemote,
    job_type: Array.isArray(item.jobType) ? item.jobType.join(',') : (item.jobType || null),
    salary_min: item.salary?.salaryMin || null,
    salary_max: item.salary?.salaryMax || null,
    salary_currency: item.salary?.salaryCurrency || 'USD',
    compensation: null,
    experience_level: null,
    category: null,
    skills: [],
    description: item.descriptionText || item.description || null,
    description_html: item.descriptionHtml || null,
    apply_url: item.applyUrl || item.jobUrl || null,
    job_url: item.jobUrl || null,
    posted_at: item.datePublished ? new Date(item.datePublished).toISOString() : null,
    raw: item,
  }
}`)
  
  console.log('\n🔍 Available fields in response:')
  fields.forEach(field => {
    const value = sampleItem[field]
    const type = typeof value
    console.log(`  ${field}: ${type}`)
  })
}

main().catch(console.error)



