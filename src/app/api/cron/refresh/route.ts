import { NextRequest, NextResponse } from 'next/server'
import pg from 'pg'
import { createClient as createSanityClient } from '@sanity/client'
import { JobsIngestService } from '@/lib/services/jobs-ingest'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.INGEST_SECRET
  if (!secret) return true
  const header = req.headers.get('x-ingest-secret')
  if (header && header === secret) return true
  const urlSecret = req.nextUrl.searchParams.get('secret')
  return urlSecret === secret
}

async function clearBlogs() {
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
  const token = process.env.SANITY_API_TOKEN
  if (!projectId || projectId === 'dummy-project-id' || !token) return { skipped: true }
  const sanity = createSanityClient({ projectId, dataset, apiVersion: '2023-12-01', useCdn: false, token })
  const count = await sanity.fetch('count(*[_type=="blogPost"])')
  if (count === 0) return { deleted: 0 }
  await sanity.delete({ query: '*[_type=="blogPost"]' })
  return { deleted: count }
}

async function clearJobs() {
  const dbUrl = process.env.SUPABASE_DB_URL
  if (!dbUrl) return { skipped: true }
  const client = new pg.Client({ connectionString: dbUrl })
  await client.connect()
  try {
    // Delete external and internal jobs
    const ext = await client.query('SELECT COUNT(*)::int AS c FROM external_jobs')
    const extCount = ext.rows?.[0]?.c ?? 0
    const intRes = await client.query('SELECT COUNT(*)::int AS c FROM jobs')
    const intCount = intRes.rows?.[0]?.c ?? 0
    await client.query('DELETE FROM external_jobs')
    await client.query('DELETE FROM jobs')
    return { externalDeleted: extCount, internalDeleted: intCount }
  } finally {
    await client.end()
  }
}

export async function GET(req: NextRequest) {
  try {
    if (!isAuthorized(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const [blogs, jobs] = await Promise.all([clearBlogs(), clearJobs()])

    // Ingest fresh
    const limit = 50
    const indeedParams = {
      country: 'us',
      fromDays: '3',
      maxRows: limit,
      maxRowsPerUrl: limit,
      query: 'Growth Marketing',
      urls: [] as string[],
    }
    const indeed = await JobsIngestService.fetchIndeed(indeedParams, limit)
    const rows = indeed.map(JobsIngestService.mapIndeed)
    const { createdPosts } = await JobsIngestService.upsertJobs(rows)

    return NextResponse.json({ success: true, cleared: { blogs, jobs }, fetched: rows.length, createdPosts })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Cron refresh failed'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}


