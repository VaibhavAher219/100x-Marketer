import { NextResponse } from 'next/server'

export async function GET() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const body = `User-agent: *
Allow: /

Sitemap: ${siteUrl}/sitemap.xml`

  return new NextResponse(body, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}





