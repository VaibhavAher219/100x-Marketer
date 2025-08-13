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
  console.error('Sanity not configured. Set NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET, SANITY_API_TOKEN')
  process.exit(1)
}

const client = createClient({ projectId, dataset, apiVersion: '2023-12-01', token, useCdn: false })

try {
  const count = await client.fetch('count(*[_type=="blogPost"])')
  if (count === 0) {
    console.log('No blog posts to delete.')
    process.exit(0)
  }
  const res = await client.delete({ query: '*[_type=="blogPost"]' })
  const deleted = Array.isArray(res?.results) ? res.results.length : count
  console.log(JSON.stringify({ deleted, priorCount: count }))
} catch (e) {
  console.error(e)
  process.exit(1)
}


