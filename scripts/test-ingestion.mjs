#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import dotenv from 'dotenv'
import pg from 'pg'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

console.log('🧪 Testing complete ingestion pipeline...\n')

// Import the services directly
async function testDirectIngestion() {
  const APIFY_TOKEN = process.env.APIFY_TOKEN
  const SUPABASE_DB_URL = process.env.SUPABASE_DB_URL

  if (!APIFY_TOKEN) {
    console.error('❌ Missing APIFY_TOKEN')
    return false
  }

  if (!SUPABASE_DB_URL) {
    console.error('❌ Missing SUPABASE_DB_URL')
    return false
  }

  console.log('✅ Environment variables found')
  console.log('📡 Testing direct API call...')

  try {
    // Step 1: Fetch from Apify
    const endpoint = `https://api.apify.com/v2/acts/borderline~indeed-scraper/run-sync-get-dataset-items?token=${encodeURIComponent(APIFY_TOKEN)}`
    
    const payload = {
      country: 'us',
      fromDays: '3',
      maxRows: 20,
      maxRowsPerUrl: 20,
      query: 'Growth Marketing',
      urls: [
        'https://www.indeed.com/jobs?q=Growth+Marketing+Manager&l=Remote&fromage=7&sc=0kf%3Aattr%28DSQF7%29%3B&from=searchOnDesktopSerp&vjk=9c9039e535541977',
        'https://www.indeed.com/jobs?q=ecommerce+marketing&l=Remote&from=searchOnDesktopSerp%2Cwhatautocomplete%2CwhatautocompleteSourceStandard&cf-turnstile-response=0.fkvU-_LwmM3vmPE2ZTHvHGuZhCUDW02sWfmXxu4tIdfcLnCRxJM6H8EUou3cQ8xqICCyTIo9PNiLLPg4-v1XP180sSGIjvK1vTy7RRLF510oXMNW8mcr5lLeRrWN2WAFQbt0FBfwEHZXSSCVk1nFGcP4nIiQSPBg5_D4qB339cX5VvIeBw-wTuHvrfmHJTKSntCqC2PhYZ3w_SMNGROeNAbI9qX3xoLmtC5ft9uQiA0dWmV-YZIUMFGnQi2DZv5HPyP1wgs-ILmZ6NFNVI7iabdvcTuzPaKmiK7XyhQ-zxAduo1glHnEtlPax6tEnJ0gdAHT5n9Z2b2wuNvyAAUWMbI0iJ0FNmWPFLTxKnY08d2Zi7cOrct7ricjUoEvGVx6G3qysgLF6fzAjnq3CozoeGP-w-Zm6mgSAIDBoiSYf7HUaZNW_yppPl8-RG85LHX2ZVqgeOnnNuds4YR5LPcj0GZXWHDtRBlES6PU-ZCO0Yqawe_S4YaotqSNQf8QpWQr9h2hvHK2jmkgjwjR0IhVNS0n31qx7ircapdZ_jGPfm5UFiGYIYJ48kWYfH6HRIXDfzPMxbY4Cy32446Aq8mcfG9fOqq5SzSdJ1TCHanwkqcZ3jI92DNugegzWsSFq9M5VrLwtesOOnWWvKv8bCufXfNP1u4HJixC4jOmtHA7WXZITCOOAygIt4DpqZ467l-Ir5ObmhSJt14BEmAEbFEEhGVrMzDVV85mQPeKHbXA5_CWDSQK1oUSZeq2xG3lipN5WE9I3joAuDOqjV4MyaotP96Em33f_qxi2fGRSNWrWYyNyfZaYzeg3QwDQxPb4D9Mh6uXaB81yM4-T2TkyZqOvHpAIyGkHsFkVoco6LFOpKOkw9osiBh4CIfXa0HW4i1f4q-09sVcBHaqGjarWbuN7g.Ui-8c4IK1xEPlM2nioqmCw.08254b22c09a90e58a1c342a2930d61188c89a0c73afbfb9ba2218670a7c56cd&vjk=9f925eb42d64a11e'
      ]
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Apify API error:', errorText)
      return false
    }

    const items = await response.json()
    console.log(`✅ Fetched ${items.length} jobs from Apify`)

    if (items.length === 0) {
      console.log('⚠️  No jobs returned from API')
      return true
    }

    // Step 2: Map the data
    const mappedJobs = items.map(item => ({
      source: 'indeed',
      external_id: item.jobKey || item.jobUrl || '',
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
      compensation: item.salary?.salaryText || null,
      experience_level: null,
      category: item.occupation?.[0] || null,
      skills: item.attributes || [],
      description: item.descriptionText || null,
      description_html: item.descriptionHtml || null,
      apply_url: item.applyUrl || item.jobUrl || null,
      job_url: item.jobUrl || null,
      posted_at: item.datePublished ? new Date(item.datePublished).toISOString() : null,
      raw: item,
    }))

    console.log('✅ Mapped jobs successfully')
    console.log(`📊 Sample mapped job:`)
    console.log(JSON.stringify(mappedJobs[0], null, 2))

    // Step 3: Insert into database
    console.log('\n💾 Inserting into database...')
    const client = new pg.Client({ connectionString: SUPABASE_DB_URL })
    await client.connect()

    let insertedCount = 0
    for (const job of mappedJobs) {
      try {
        await client.query(
          `INSERT INTO external_jobs (
            source, external_id, title, company_name, company_url, company_logo_url,
            location, is_remote, job_type, salary_min, salary_max, salary_currency,
            compensation, experience_level, category, skills, description, description_html,
            apply_url, job_url, posted_at, raw
          ) VALUES (
            $1,$2,$3,$4,$5,$6,
            $7,$8,$9,$10,$11,$12,
            $13,$14,$15,$16,$17,$18,
            $19,$20,$21,$22
          )
          ON CONFLICT (source, external_id) DO UPDATE SET
            title=EXCLUDED.title,
            company_name=EXCLUDED.company_name,
            company_url=EXCLUDED.company_url,
            company_logo_url=EXCLUDED.company_logo_url,
            location=EXCLUDED.location,
            is_remote=EXCLUDED.is_remote,
            job_type=EXCLUDED.job_type,
            salary_min=EXCLUDED.salary_min,
            salary_max=EXCLUDED.salary_max,
            salary_currency=EXCLUDED.salary_currency,
            compensation=EXCLUDED.compensation,
            experience_level=EXCLUDED.experience_level,
            category=EXCLUDED.category,
            skills=EXCLUDED.skills,
            description=EXCLUDED.description,
            description_html=EXCLUDED.description_html,
            apply_url=EXCLUDED.apply_url,
            job_url=EXCLUDED.job_url,
            posted_at=EXCLUDED.posted_at,
            raw=EXCLUDED.raw,
            updated_at=NOW()
          `,
          [
            job.source,
            job.external_id,
            job.title,
            job.company_name,
            job.company_url,
            job.company_logo_url,
            job.location,
            job.is_remote,
            job.job_type,
            job.salary_min,
            job.salary_max,
            job.salary_currency,
            job.compensation,
            job.experience_level,
            job.category,
            job.skills,
            job.description,
            job.description_html,
            job.apply_url,
            job.job_url,
            job.posted_at ? new Date(job.posted_at) : null,
            job.raw,
          ]
        )
        insertedCount++
      } catch (error) {
        console.error(`❌ Failed to insert job ${job.external_id}:`, error.message)
      }
    }

    await client.end()

    console.log(`✅ Successfully inserted/updated ${insertedCount} jobs`)

    // Step 4: Verify via API
    console.log('\n🔍 Verifying via API...')
    try {
      const verifyResponse = await fetch('http://localhost:3000/api/external-jobs')
      if (verifyResponse.ok) {
        const { jobs } = await verifyResponse.json()
        console.log(`✅ API returns ${jobs.length} external jobs`)
        
        if (jobs.length > 0) {
          console.log(`📋 Sample job from API:`)
          console.log(`  ${jobs[0].title} at ${jobs[0].company_name}`)
          console.log(`  Location: ${jobs[0].location}`)
          console.log(`  Remote: ${jobs[0].is_remote}`)
          console.log(`  Salary: ${jobs[0].salary_min ? `$${jobs[0].salary_min.toLocaleString()}` : 'N/A'} - ${jobs[0].salary_max ? `$${jobs[0].salary_max.toLocaleString()}` : 'N/A'}`)
        }
      } else {
        console.log('⚠️  API verification failed')
      }
    } catch (error) {
      console.log('⚠️  Could not verify via API:', error.message)
    }

    return true

  } catch (error) {
    console.error('❌ Ingestion failed:', error.message)
    console.error(error.stack)
    return false
  }
}

testDirectIngestion().then(success => {
  if (success) {
    console.log('\n🎉 Ingestion pipeline test completed successfully!')
    console.log('🌐 Check http://localhost:3000/jobs/explore to see jobs in the UI')
  } else {
    console.log('\n💥 Ingestion pipeline test failed')
    process.exit(1)
  }
})

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import dotenv from 'dotenv'
import pg from 'pg'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

console.log('🧪 Testing complete ingestion pipeline...\n')

// Import the services directly
async function testDirectIngestion() {
  const APIFY_TOKEN = process.env.APIFY_TOKEN
  const SUPABASE_DB_URL = process.env.SUPABASE_DB_URL

  if (!APIFY_TOKEN) {
    console.error('❌ Missing APIFY_TOKEN')
    return false
  }

  if (!SUPABASE_DB_URL) {
    console.error('❌ Missing SUPABASE_DB_URL')
    return false
  }

  console.log('✅ Environment variables found')
  console.log('📡 Testing direct API call...')

  try {
    // Step 1: Fetch from Apify
    const endpoint = `https://api.apify.com/v2/acts/borderline~indeed-scraper/run-sync-get-dataset-items?token=${encodeURIComponent(APIFY_TOKEN)}`
    
    const payload = {
      country: 'us',
      fromDays: '3',
      maxRows: 20,
      maxRowsPerUrl: 20,
      query: 'Growth Marketing',
      urls: [
        'https://www.indeed.com/jobs?q=Growth+Marketing+Manager&l=Remote&fromage=7&sc=0kf%3Aattr%28DSQF7%29%3B&from=searchOnDesktopSerp&vjk=9c9039e535541977',
        'https://www.indeed.com/jobs?q=ecommerce+marketing&l=Remote&from=searchOnDesktopSerp%2Cwhatautocomplete%2CwhatautocompleteSourceStandard&cf-turnstile-response=0.fkvU-_LwmM3vmPE2ZTHvHGuZhCUDW02sWfmXxu4tIdfcLnCRxJM6H8EUou3cQ8xqICCyTIo9PNiLLPg4-v1XP180sSGIjvK1vTy7RRLF510oXMNW8mcr5lLeRrWN2WAFQbt0FBfwEHZXSSCVk1nFGcP4nIiQSPBg5_D4qB339cX5VvIeBw-wTuHvrfmHJTKSntCqC2PhYZ3w_SMNGROeNAbI9qX3xoLmtC5ft9uQiA0dWmV-YZIUMFGnQi2DZv5HPyP1wgs-ILmZ6NFNVI7iabdvcTuzPaKmiK7XyhQ-zxAduo1glHnEtlPax6tEnJ0gdAHT5n9Z2b2wuNvyAAUWMbI0iJ0FNmWPFLTxKnY08d2Zi7cOrct7ricjUoEvGVx6G3qysgLF6fzAjnq3CozoeGP-w-Zm6mgSAIDBoiSYf7HUaZNW_yppPl8-RG85LHX2ZVqgeOnnNuds4YR5LPcj0GZXWHDtRBlES6PU-ZCO0Yqawe_S4YaotqSNQf8QpWQr9h2hvHK2jmkgjwjR0IhVNS0n31qx7ircapdZ_jGPfm5UFiGYIYJ48kWYfH6HRIXDfzPMxbY4Cy32446Aq8mcfG9fOqq5SzSdJ1TCHanwkqcZ3jI92DNugegzWsSFq9M5VrLwtesOOnWWvKv8bCufXfNP1u4HJixC4jOmtHA7WXZITCOOAygIt4DpqZ467l-Ir5ObmhSJt14BEmAEbFEEhGVrMzDVV85mQPeKHbXA5_CWDSQK1oUSZeq2xG3lipN5WE9I3joAuDOqjV4MyaotP96Em33f_qxi2fGRSNWrWYyNyfZaYzeg3QwDQxPb4D9Mh6uXaB81yM4-T2TkyZqOvHpAIyGkHsFkVoco6LFOpKOkw9osiBh4CIfXa0HW4i1f4q-09sVcBHaqGjarWbuN7g.Ui-8c4IK1xEPlM2nioqmCw.08254b22c09a90e58a1c342a2930d61188c89a0c73afbfb9ba2218670a7c56cd&vjk=9f925eb42d64a11e'
      ]
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Apify API error:', errorText)
      return false
    }

    const items = await response.json()
    console.log(`✅ Fetched ${items.length} jobs from Apify`)

    if (items.length === 0) {
      console.log('⚠️  No jobs returned from API')
      return true
    }

    // Step 2: Map the data
    const mappedJobs = items.map(item => ({
      source: 'indeed',
      external_id: item.jobKey || item.jobUrl || '',
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
      compensation: item.salary?.salaryText || null,
      experience_level: null,
      category: item.occupation?.[0] || null,
      skills: item.attributes || [],
      description: item.descriptionText || null,
      description_html: item.descriptionHtml || null,
      apply_url: item.applyUrl || item.jobUrl || null,
      job_url: item.jobUrl || null,
      posted_at: item.datePublished ? new Date(item.datePublished).toISOString() : null,
      raw: item,
    }))

    console.log('✅ Mapped jobs successfully')
    console.log(`📊 Sample mapped job:`)
    console.log(JSON.stringify(mappedJobs[0], null, 2))

    // Step 3: Insert into database
    console.log('\n💾 Inserting into database...')
    const client = new pg.Client({ connectionString: SUPABASE_DB_URL })
    await client.connect()

    let insertedCount = 0
    for (const job of mappedJobs) {
      try {
        await client.query(
          `INSERT INTO external_jobs (
            source, external_id, title, company_name, company_url, company_logo_url,
            location, is_remote, job_type, salary_min, salary_max, salary_currency,
            compensation, experience_level, category, skills, description, description_html,
            apply_url, job_url, posted_at, raw
          ) VALUES (
            $1,$2,$3,$4,$5,$6,
            $7,$8,$9,$10,$11,$12,
            $13,$14,$15,$16,$17,$18,
            $19,$20,$21,$22
          )
          ON CONFLICT (source, external_id) DO UPDATE SET
            title=EXCLUDED.title,
            company_name=EXCLUDED.company_name,
            company_url=EXCLUDED.company_url,
            company_logo_url=EXCLUDED.company_logo_url,
            location=EXCLUDED.location,
            is_remote=EXCLUDED.is_remote,
            job_type=EXCLUDED.job_type,
            salary_min=EXCLUDED.salary_min,
            salary_max=EXCLUDED.salary_max,
            salary_currency=EXCLUDED.salary_currency,
            compensation=EXCLUDED.compensation,
            experience_level=EXCLUDED.experience_level,
            category=EXCLUDED.category,
            skills=EXCLUDED.skills,
            description=EXCLUDED.description,
            description_html=EXCLUDED.description_html,
            apply_url=EXCLUDED.apply_url,
            job_url=EXCLUDED.job_url,
            posted_at=EXCLUDED.posted_at,
            raw=EXCLUDED.raw,
            updated_at=NOW()
          `,
          [
            job.source,
            job.external_id,
            job.title,
            job.company_name,
            job.company_url,
            job.company_logo_url,
            job.location,
            job.is_remote,
            job.job_type,
            job.salary_min,
            job.salary_max,
            job.salary_currency,
            job.compensation,
            job.experience_level,
            job.category,
            job.skills,
            job.description,
            job.description_html,
            job.apply_url,
            job.job_url,
            job.posted_at ? new Date(job.posted_at) : null,
            job.raw,
          ]
        )
        insertedCount++
      } catch (error) {
        console.error(`❌ Failed to insert job ${job.external_id}:`, error.message)
      }
    }

    await client.end()

    console.log(`✅ Successfully inserted/updated ${insertedCount} jobs`)

    // Step 4: Verify via API
    console.log('\n🔍 Verifying via API...')
    try {
      const verifyResponse = await fetch('http://localhost:3000/api/external-jobs')
      if (verifyResponse.ok) {
        const { jobs } = await verifyResponse.json()
        console.log(`✅ API returns ${jobs.length} external jobs`)
        
        if (jobs.length > 0) {
          console.log(`📋 Sample job from API:`)
          console.log(`  ${jobs[0].title} at ${jobs[0].company_name}`)
          console.log(`  Location: ${jobs[0].location}`)
          console.log(`  Remote: ${jobs[0].is_remote}`)
          console.log(`  Salary: ${jobs[0].salary_min ? `$${jobs[0].salary_min.toLocaleString()}` : 'N/A'} - ${jobs[0].salary_max ? `$${jobs[0].salary_max.toLocaleString()}` : 'N/A'}`)
        }
      } else {
        console.log('⚠️  API verification failed')
      }
    } catch (error) {
      console.log('⚠️  Could not verify via API:', error.message)
    }

    return true

  } catch (error) {
    console.error('❌ Ingestion failed:', error.message)
    console.error(error.stack)
    return false
  }
}

testDirectIngestion().then(success => {
  if (success) {
    console.log('\n🎉 Ingestion pipeline test completed successfully!')
    console.log('🌐 Check http://localhost:3000/jobs/explore to see jobs in the UI')
  } else {
    console.log('\n💥 Ingestion pipeline test failed')
    process.exit(1)
  }
})



