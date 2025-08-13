import { NextResponse } from 'next/server'
import { getAllPosts } from '@/lib/sanity'

export async function GET() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const posts = await getAllPosts()

  const urls: string[] = [
    '',
    'blog',
    ...posts.map((p) => `blog/${p.slug.current}`),
  ]

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (path) => `  <url>
    <loc>${siteUrl}/${path}</loc>
  </url>`
  )
  .join('\n')}
</urlset>`

  return new NextResponse(body, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=1800',
    },
  })
}


