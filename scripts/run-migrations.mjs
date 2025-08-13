#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import url from 'node:url'
import { fileURLToPath } from 'node:url'
import dotenv from 'dotenv'
import pg from 'pg'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const { Client } = pg

const dbUrl = process.env.SUPABASE_DB_URL
if (!dbUrl) {
  console.error('Missing SUPABASE_DB_URL in .env.local. Aborting migrations.')
  process.exit(1)
}

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const migrationsDir = path.resolve(process.cwd(), 'supabase', 'migrations')

async function readSqlFiles(dir) {
  const entries = await fs.promises.readdir(dir, { withFileTypes: true })
  const files = entries
    .filter((e) => e.isFile() && e.name.endsWith('.sql'))
    .map((e) => path.join(dir, e.name))
    .sort()
  return files
}

async function run() {
  const client = new Client({ connectionString: dbUrl })
  await client.connect()
  console.log('Connected to database')

  // Simple migrations table
  await client.query(
    `CREATE TABLE IF NOT EXISTS _migrations (
      id SERIAL PRIMARY KEY,
      filename TEXT UNIQUE NOT NULL,
      executed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`
  )

  const files = await readSqlFiles(migrationsDir)

  async function tableExists(client, tableName) {
    const { rows } = await client.query(
      `SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = $1 LIMIT 1`,
      [tableName]
    )
    return rows.length > 0
  }

  async function baselineIfPresent(client, filename) {
    try {
      if (filename.includes('001_create_job_portal_schema')) {
        if (await tableExists(client, 'profiles')) return true
      }
      if (filename.includes('003_add_applications_table')) {
        if (await tableExists(client, 'applications')) return true
      }
      if (filename.includes('004_add_company_profiles')) {
        if (await tableExists(client, 'company_profiles')) return true
      }
      return false
    } catch {
      return false
    }
  }

  for (const file of files) {
    const filename = path.basename(file)
    const { rows } = await client.query('SELECT 1 FROM _migrations WHERE filename = $1', [filename])
    if (rows.length > 0) {
      console.log(`Skipping ${filename} (already applied)`) 
      continue
    }

    const sql = await fs.promises.readFile(file, 'utf8')
    console.log(`Applying ${filename} ...`)
    try {
      if (await baselineIfPresent(client, filename)) {
        await client.query('INSERT INTO _migrations(filename) VALUES ($1)', [filename])
        console.log(`Baseline applied for ${filename} (objects already exist)`) 
      } else {
        await client.query('BEGIN')
        await client.query(sql)
        await client.query('INSERT INTO _migrations(filename) VALUES ($1)', [filename])
        await client.query('COMMIT')
        console.log(`Applied ${filename}`)
      }
    } catch (err) {
      await client.query('ROLLBACK')
      console.error(`Failed ${filename}:`, err.message)
      await client.end()
      process.exit(1)
    }
  }

  await client.end()
  console.log('All migrations applied successfully')
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})



import path from 'node:path'
import url from 'node:url'
import { fileURLToPath } from 'node:url'
import dotenv from 'dotenv'
import pg from 'pg'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const { Client } = pg

const dbUrl = process.env.SUPABASE_DB_URL
if (!dbUrl) {
  console.error('Missing SUPABASE_DB_URL in .env.local. Aborting migrations.')
  process.exit(1)
}

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const migrationsDir = path.resolve(process.cwd(), 'supabase', 'migrations')

async function readSqlFiles(dir) {
  const entries = await fs.promises.readdir(dir, { withFileTypes: true })
  const files = entries
    .filter((e) => e.isFile() && e.name.endsWith('.sql'))
    .map((e) => path.join(dir, e.name))
    .sort()
  return files
}

async function run() {
  const client = new Client({ connectionString: dbUrl })
  await client.connect()
  console.log('Connected to database')

  // Simple migrations table
  await client.query(
    `CREATE TABLE IF NOT EXISTS _migrations (
      id SERIAL PRIMARY KEY,
      filename TEXT UNIQUE NOT NULL,
      executed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`
  )

  const files = await readSqlFiles(migrationsDir)

  async function tableExists(client, tableName) {
    const { rows } = await client.query(
      `SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = $1 LIMIT 1`,
      [tableName]
    )
    return rows.length > 0
  }

  async function baselineIfPresent(client, filename) {
    try {
      if (filename.includes('001_create_job_portal_schema')) {
        if (await tableExists(client, 'profiles')) return true
      }
      if (filename.includes('003_add_applications_table')) {
        if (await tableExists(client, 'applications')) return true
      }
      if (filename.includes('004_add_company_profiles')) {
        if (await tableExists(client, 'company_profiles')) return true
      }
      return false
    } catch {
      return false
    }
  }

  for (const file of files) {
    const filename = path.basename(file)
    const { rows } = await client.query('SELECT 1 FROM _migrations WHERE filename = $1', [filename])
    if (rows.length > 0) {
      console.log(`Skipping ${filename} (already applied)`) 
      continue
    }

    const sql = await fs.promises.readFile(file, 'utf8')
    console.log(`Applying ${filename} ...`)
    try {
      if (await baselineIfPresent(client, filename)) {
        await client.query('INSERT INTO _migrations(filename) VALUES ($1)', [filename])
        console.log(`Baseline applied for ${filename} (objects already exist)`) 
      } else {
        await client.query('BEGIN')
        await client.query(sql)
        await client.query('INSERT INTO _migrations(filename) VALUES ($1)', [filename])
        await client.query('COMMIT')
        console.log(`Applied ${filename}`)
      }
    } catch (err) {
      await client.query('ROLLBACK')
      console.error(`Failed ${filename}:`, err.message)
      await client.end()
      process.exit(1)
    }
  }

  await client.end()
  console.log('All migrations applied successfully')
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})


