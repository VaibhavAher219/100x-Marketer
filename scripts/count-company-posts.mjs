#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import dotenv from 'dotenv'
import { createClient } from '@sanity/client'

const envLocalPath = path.resolve(process.cwd(), '.env.local')
if (fs.existsSync(envLocalPath)) {
  dotenv.config({ path: envLocalPath })
} else {
  dotenv.config()
}

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
const token = process.env.SANITY_API_TOKEN

if (!projectId || projectId === 'dummy-project-id' || !token) {
  console.log(JSON.stringify({ enabled: false, reason: 'Sanity not configured' }))
  process.exit(0)
}

const client = createClient({ projectId, dataset, apiVersion: '2023-12-01', token, useCdn: false })

const sinceMinutes = Number(process.env.COMPANY_POSTS_SINCE_MINUTES || 15)
const since = new Date(Date.now() - sinceMinutes * 60 * 1000).toISOString()

try {
  const count = await client.fetch(
    'count(*[_type=="blogPost" && slug.current match "company-*" && _createdAt >= $since])',
    { since }
  )
  console.log(JSON.stringify({ enabled: true, since, count }))
} catch (e) {
  console.error(e)
  process.exit(1)
}


