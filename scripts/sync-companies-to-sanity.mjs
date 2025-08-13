#!/usr/bin/env node

/**
 * Sync Company Data to Sanity CMS
 * 
 * This script syncs company data from your job portal database
 * to Sanity CMS as Company Spotlight entries for blog integration.
 */

import { createClient } from '@sanity/client'
import { createClient as createPgClient } from 'pg'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  useCdn: false,
  apiVersion: '2023-12-01',
  token: process.env.SANITY_API_TOKEN,
})

const pgClient = createPgClient({
  connectionString: process.env.SUPABASE_DB_URL,
})

async function syncCompaniesToSanity() {
  try {
    console.log('🔄 Starting company sync to Sanity CMS...')
    
    await pgClient.connect()
    console.log('✅ Connected to PostgreSQL')

    // Fetch companies with active jobs
    const companiesQuery = `
      SELECT DISTINCT
        cp.id,
        cp.company_name,
        cp.website,
        cp.industry,
        cp.company_size,
        cp.description,
        cp.logo_url,
        cp.slug,
        COUNT(j.id) as active_jobs_count
      FROM company_profiles cp
      LEFT JOIN jobs j ON cp.id = j.company_id AND j.status = 'active'
      WHERE cp.company_name IS NOT NULL
      GROUP BY cp.id, cp.company_name, cp.website, cp.industry, 
               cp.company_size, cp.description, cp.logo_url, cp.slug
      HAVING COUNT(j.id) > 0
      ORDER BY COUNT(j.id) DESC
      LIMIT 50
    `

    const { rows: companies } = await pgClient.query(companiesQuery)
    console.log(`📊 Found ${companies.length} companies with active jobs`)

    let syncedCount = 0
    let errorCount = 0

    for (const company of companies) {
      try {
        // Check if company already exists in Sanity
        const existingCompany = await sanityClient.fetch(
          `*[_type == "companySpotlight" && jobPortalData.companyProfileId == $id][0]`,
          { id: company.id }
        )

        const companyDoc = {
          _type: 'companySpotlight',
          name: company.company_name,
          slug: {
            _type: 'slug',
            current: company.slug || company.company_name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
          },
          website: company.website,
          industry: company.industry,
          companySize: company.company_size,
          description: company.description,
          jobPortalData: {
            companyProfileId: company.id,
            activeJobs: parseInt(company.active_jobs_count),
            lastSynced: new Date().toISOString()
          },
          featured: company.active_jobs_count >= 5 // Auto-feature companies with 5+ jobs
        }

        // Add logo if available
        if (company.logo_url) {
          // Note: In a real implementation, you'd want to upload the image to Sanity
          // For now, we'll store the URL and handle image upload separately
          companyDoc.logoUrl = company.logo_url
        }

        if (existingCompany) {
          // Update existing company
          await sanityClient
            .patch(existingCompany._id)
            .set(companyDoc)
            .commit()
          console.log(`✅ Updated: ${company.company_name}`)
        } else {
          // Create new company
          await sanityClient.create(companyDoc)
          console.log(`🆕 Created: ${company.company_name}`)
        }

        syncedCount++
      } catch (error) {
        console.error(`❌ Error syncing ${company.company_name}:`, error.message)
        errorCount++
      }
    }

    console.log(`\n📈 Sync Summary:`)
    console.log(`   ✅ Synced: ${syncedCount} companies`)
    console.log(`   ❌ Errors: ${errorCount} companies`)
    console.log(`   📊 Total processed: ${companies.length} companies`)

  } catch (error) {
    console.error('💥 Sync failed:', error.message)
    process.exit(1)
  } finally {
    await pgClient.end()
    console.log('🔌 Disconnected from PostgreSQL')
  }
}

async function validateConfig() {
  const required = [
    'NEXT_PUBLIC_SANITY_PROJECT_ID',
    'SANITY_API_TOKEN',
    'SUPABASE_DB_URL'
  ]

  const missing = required.filter(key => !process.env[key])
  
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:')
    missing.forEach(key => console.error(`   - ${key}`))
    console.error('\nPlease check your .env.local file and CMS_SETUP.md')
    process.exit(1)
  }

  try {
    // Test Sanity connection
    await sanityClient.fetch('*[_type == "companySpotlight"][0]')
    console.log('✅ Sanity connection verified')
  } catch (error) {
    console.error('❌ Sanity connection failed:', error.message)
    console.error('Please check your SANITY_API_TOKEN and project configuration')
    process.exit(1)
  }
}

// Main execution
async function main() {
  console.log('🚀 Company Sync Tool - Job Portal to Sanity CMS\n')
  
  await validateConfig()
  await syncCompaniesToSanity()
  
  console.log('\n🎉 Sync completed successfully!')
  console.log('Visit /admin to manage your company spotlights')
}

main().catch(error => {
  console.error('💥 Fatal error:', error)
  process.exit(1)
})


/**
 * Sync Company Data to Sanity CMS
 * 
 * This script syncs company data from your job portal database
 * to Sanity CMS as Company Spotlight entries for blog integration.
 */

import { createClient } from '@sanity/client'
import { createClient as createPgClient } from 'pg'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  useCdn: false,
  apiVersion: '2023-12-01',
  token: process.env.SANITY_API_TOKEN,
})

const pgClient = createPgClient({
  connectionString: process.env.SUPABASE_DB_URL,
})

async function syncCompaniesToSanity() {
  try {
    console.log('🔄 Starting company sync to Sanity CMS...')
    
    await pgClient.connect()
    console.log('✅ Connected to PostgreSQL')

    // Fetch companies with active jobs
    const companiesQuery = `
      SELECT DISTINCT
        cp.id,
        cp.company_name,
        cp.website,
        cp.industry,
        cp.company_size,
        cp.description,
        cp.logo_url,
        cp.slug,
        COUNT(j.id) as active_jobs_count
      FROM company_profiles cp
      LEFT JOIN jobs j ON cp.id = j.company_id AND j.status = 'active'
      WHERE cp.company_name IS NOT NULL
      GROUP BY cp.id, cp.company_name, cp.website, cp.industry, 
               cp.company_size, cp.description, cp.logo_url, cp.slug
      HAVING COUNT(j.id) > 0
      ORDER BY COUNT(j.id) DESC
      LIMIT 50
    `

    const { rows: companies } = await pgClient.query(companiesQuery)
    console.log(`📊 Found ${companies.length} companies with active jobs`)

    let syncedCount = 0
    let errorCount = 0

    for (const company of companies) {
      try {
        // Check if company already exists in Sanity
        const existingCompany = await sanityClient.fetch(
          `*[_type == "companySpotlight" && jobPortalData.companyProfileId == $id][0]`,
          { id: company.id }
        )

        const companyDoc = {
          _type: 'companySpotlight',
          name: company.company_name,
          slug: {
            _type: 'slug',
            current: company.slug || company.company_name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
          },
          website: company.website,
          industry: company.industry,
          companySize: company.company_size,
          description: company.description,
          jobPortalData: {
            companyProfileId: company.id,
            activeJobs: parseInt(company.active_jobs_count),
            lastSynced: new Date().toISOString()
          },
          featured: company.active_jobs_count >= 5 // Auto-feature companies with 5+ jobs
        }

        // Add logo if available
        if (company.logo_url) {
          // Note: In a real implementation, you'd want to upload the image to Sanity
          // For now, we'll store the URL and handle image upload separately
          companyDoc.logoUrl = company.logo_url
        }

        if (existingCompany) {
          // Update existing company
          await sanityClient
            .patch(existingCompany._id)
            .set(companyDoc)
            .commit()
          console.log(`✅ Updated: ${company.company_name}`)
        } else {
          // Create new company
          await sanityClient.create(companyDoc)
          console.log(`🆕 Created: ${company.company_name}`)
        }

        syncedCount++
      } catch (error) {
        console.error(`❌ Error syncing ${company.company_name}:`, error.message)
        errorCount++
      }
    }

    console.log(`\n📈 Sync Summary:`)
    console.log(`   ✅ Synced: ${syncedCount} companies`)
    console.log(`   ❌ Errors: ${errorCount} companies`)
    console.log(`   📊 Total processed: ${companies.length} companies`)

  } catch (error) {
    console.error('💥 Sync failed:', error.message)
    process.exit(1)
  } finally {
    await pgClient.end()
    console.log('🔌 Disconnected from PostgreSQL')
  }
}

async function validateConfig() {
  const required = [
    'NEXT_PUBLIC_SANITY_PROJECT_ID',
    'SANITY_API_TOKEN',
    'SUPABASE_DB_URL'
  ]

  const missing = required.filter(key => !process.env[key])
  
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:')
    missing.forEach(key => console.error(`   - ${key}`))
    console.error('\nPlease check your .env.local file and CMS_SETUP.md')
    process.exit(1)
  }

  try {
    // Test Sanity connection
    await sanityClient.fetch('*[_type == "companySpotlight"][0]')
    console.log('✅ Sanity connection verified')
  } catch (error) {
    console.error('❌ Sanity connection failed:', error.message)
    console.error('Please check your SANITY_API_TOKEN and project configuration')
    process.exit(1)
  }
}

// Main execution
async function main() {
  console.log('🚀 Company Sync Tool - Job Portal to Sanity CMS\n')
  
  await validateConfig()
  await syncCompaniesToSanity()
  
  console.log('\n🎉 Sync completed successfully!')
  console.log('Visit /admin to manage your company spotlights')
}

main().catch(error => {
  console.error('💥 Fatal error:', error)
  process.exit(1)
})



