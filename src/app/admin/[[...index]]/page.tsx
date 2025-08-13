/**
 * Sanity Studio host route.
 * Uses a graceful fallback when Sanity is not configured.
 */
"use client"

import { NextStudio } from 'next-sanity/studio'
import config from '../../../../sanity.config'
import Link from 'next/link'

export default function StudioPage() {
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
  const isConfigured = projectId && projectId !== 'dummy-project-id'

  if (!isConfigured) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Sanity CMS Setup Required</h1>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6 text-left">
              <p className="text-blue-800 mb-3">Add these to .env.local and restart dev server:</p>
              <pre className="bg-blue-100 p-3 rounded text-xs font-mono">
NEXT_PUBLIC_SANITY_PROJECT_ID=your-project-id
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=your-write-token
              </pre>
              <p className="text-blue-800 mt-3">
                See CMS_SETUP.md for full instructions.
              </p>
            </div>
            <div className="flex justify-center gap-3">
              <a href="https://sanity.io" target="_blank" rel="noreferrer" className="bg-blue-600 text-white px-4 py-2 rounded">Open Sanity</a>
              <Link href="/blog" className="bg-gray-200 px-4 py-2 rounded">View Blog</Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return <NextStudio config={config} />
}


