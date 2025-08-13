import { NextRequest, NextResponse } from 'next/server'
import { JobsIngestService } from '@/lib/services/jobs-ingest'
import { getClientIp, rateLimit } from '@/lib/rate-limit'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    // Basic rate limit per client IP
    const ip = getClientIp(req.headers)
    const { allowed } = rateLimit(`ingest:${ip}`, { capacity: 3, refillPerMs: 60_000 })
    if (!allowed) return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })

    // Optional shared-secret auth
    const ingestSecret = process.env.INGEST_SECRET
    if (ingestSecret) {
      const provided = req.headers.get('x-ingest-secret')
      if (!provided || provided !== ingestSecret) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }
    if (!process.env.APIFY_TOKEN) {
      return NextResponse.json({ error: 'Missing APIFY_TOKEN' }, { status: 500 })
    }

    // Strict input parsing & defaults
    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>
    const sanitized = {
      limit: Number.isFinite(Number(body?.limit)) ? Number(body.limit) : undefined,
      country: typeof body?.country === 'string' ? body.country : undefined,
      query: typeof body?.query === 'string' ? body.query : undefined,
      fromDays: typeof body?.fromDays === 'string' ? body.fromDays : undefined,
      urls: Array.isArray(body?.urls) ? body.urls.filter((u: unknown) => typeof u === 'string') : undefined,
      maxRowsPerUrl: Number.isFinite(Number(body?.maxRowsPerUrl)) ? Number(body.maxRowsPerUrl) : undefined,
    }
    const requested = Number(sanitized.limit ?? 50)
    const limit = Math.max(1, Math.min(50, isNaN(requested) ? 50 : requested))

    const bodyUrls = sanitized.urls || []
    const indeedParams = {
      country: sanitized.country || 'us',
      fromDays: sanitized.fromDays || '3',
      maxRows: limit,
      maxRowsPerUrl: Math.min(limit, sanitized.maxRowsPerUrl || limit),
      query: sanitized.query || 'Growth Marketing',
      urls: bodyUrls.length > 0 ? bodyUrls : [
        'https://www.indeed.com/jobs?q=Growth+Marketing+Manager&l=Remote&fromage=7&sc=0kf%3Aattr%28DSQF7%29%3B&from=searchOnDesktopSerp&vjk=9c9039e535541977',
        'https://www.indeed.com/jobs?q=ecommerce+marketing&l=Remote&from=searchOnDesktopSerp%2Cwhatautocomplete%2CwhatautocompleteSourceStandard&cf-turnstile-response=0.fkvU-_LwmM3vmPE2ZTHvHGuZhCUDW02sWfmXxu4tIdfcLnCRxJM6H8EUou3cQ8xqICCyTIo9PNiLLPg4-v1XP180sSGIjvK1vTy7RRLF510oXMNW8mcr5lLeRrWN2WAFQbt0FBfwEHZXSSCVk1nFGcP4nIiQSPBg5_D4qB339cX5VvIeBw-wTuHvrfmHJTKSntCqC2PhYZ3w_SMNGROeNAbI9qX3xoLmtC5ft9uQiA0dWmV-YZIUMFGnQi2DZv5HPyP1wgs-ILmZ6NFNVI7iabdvcTuzPaKmiK7XyhQ-zxAduo1glHnEtlPax6tEnJ0gdAHT5n9Z2b2wuNvyAAUWMbI0iJ0FNmWPFLTxKnY08d2Zi7cOrct7ricjUoEvGVx6G3qysgLF6fzAjnq3CozoeGP-w-Zm6mgSAIDBoiSYf7HUaZNW_yppPl8-RG85LHX2ZVqgeOnnNuds4YR5LPcj0GZXWHDtRBlES6PU-ZCO0Yqawe_S4YaotqSNQf8QpWQr9h2hvHK2jmkgjwjR0IhVNS0n31qx7ircapdZ_jGPfm5UFiGYIYJ48kWYfH6HRIXDfzPMxbY4Cy32446Aq8mcfG9fOqq5SzSdJ1TCHanwkqcZ3jI92DNugegzWsSFq9M5VrLwtesOOnWWvKv8bCufXfNP1u4HJixC4jOmtHA7WXZITCOOAygIt4DpqZ467l-Ir5ObmhSJt14BEmAEbFEEhGVrMzDVV85mQPeKHbXA5_CWDSQK1oUSZeq2xG3lipN5WE9I3joAuDOqjV4MyaotP96Em33f_qxi2fGRSNWrWYyNyfZaYzeg3QwDQxPb4D9Mh6uXaB81yM4-T2TkyZqOvHpAIyGkHsFkVoco6LFOpKOkw9osiBh4CIfXa0HW4i1f4q-09sVcBHaqGjarWbuN7g.Ui-8c4IK1xEPlM2nioqmCw.08254b22c09a90e58a1c342a2930d61188c89a0c73afbfb9ba2218670a7c56cd&vjk=9f925eb42d64a11e'
      ],
    }

    const indeed = await JobsIngestService.fetchIndeed(indeedParams, limit)
    const rows = indeed.map(JobsIngestService.mapIndeed)
    // De-duplicate by source+external_id within this run
    const seen = new Set<string>()
    const deduped = rows.filter((r) => {
      const key = `${r.source}:${r.external_id}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
    const { createdPosts } = await JobsIngestService.upsertJobs(deduped)

    return NextResponse.json({ 
      success: true, 
      fetched: deduped.length, 
      createdPosts 
    })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Ingest failed'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}


