#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import dotenv from 'dotenv'
import { createClient } from '@sanity/client'

// Load env from .env.local if present, otherwise fall back to .env
const envLocalPath = path.resolve(process.cwd(), '.env.local')
if (fs.existsSync(envLocalPath)) {
  dotenv.config({ path: envLocalPath })
} else {
  dotenv.config()
}

function exitWithError(message) {
  console.error(`Error: ${message}`)
  process.exit(1)
}

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
const token = process.env.SANITY_API_TOKEN

if (!projectId) exitWithError('NEXT_PUBLIC_SANITY_PROJECT_ID is not set')
if (!dataset) exitWithError('NEXT_PUBLIC_SANITY_DATASET is not set')
if (!token) exitWithError('SANITY_API_TOKEN is not set (needs Editor or greater)')

const client = createClient({
  projectId,
  dataset,
  apiVersion: '2023-12-01',
  useCdn: false,
  token,
})

function toSlug(value) {
  return String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

async function getOrCreateAuthor(name) {
  const slug = toSlug(name)
  const existing = await client.fetch(
    '*[_type=="author" && slug.current==$slug][0]',
    { slug }
  )
  if (existing) return existing

  const doc = {
    _type: 'author',
    name,
    slug: { current: slug },
    role: 'editor',
  }
  return client.create(doc)
}

async function getOrCreateCategory(title) {
  const slug = toSlug(title)
  const existing = await client.fetch(
    '*[_type=="category" && slug.current==$slug][0]',
    { slug }
  )
  if (existing) return existing
  const doc = {
    _type: 'category',
    title,
    slug: { current: slug },
    description: 'Announcements and product updates',
    color: 'blue',
  }
  return client.create(doc)
}

async function createOrUpdatePost() {
  const postId = 'blogPost-introducing-mesha'
  const title = 'Introducing Mesha'
  const slug = 'introducing-mesha'
  const excerpt = 'Meet Mesha — our new initiative to empower marketers with practical growth playbooks and company spotlights.'

  const [author, category] = await Promise.all([
    getOrCreateAuthor('100x Marketers Team'),
    getOrCreateCategory('Announcements'),
  ])

  const body = [
    {
      _type: 'block',
      style: 'h2',
      children: [
        { _type: 'span', text: 'Welcome to Mesha' },
      ],
      markDefs: [],
    },
    {
      _type: 'block',
      style: 'normal',
      children: [
        { _type: 'span', text: 'Mesha is our new home for actionable marketing insights, featuring company spotlights, growth strategies, and curated opportunities for ambitious marketers.' },
      ],
      markDefs: [],
    },
  ]

  const baseDoc = {
    _id: postId,
    _type: 'blogPost',
    title,
    slug: { current: slug },
    author: { _type: 'reference', _ref: author._id },
    categories: [{ _type: 'reference', _ref: category._id }],
    excerpt,
    body,
    publishedAt: new Date().toISOString(),
    featured: false,
    seo: {
      metaTitle: title,
      metaDescription: excerpt,
    },
  }

  // Create if missing, then ensure it is published
  const created = await client.createIfNotExists(baseDoc)
  // Patch to update fields in case it already existed
  await client
    .patch(created._id)
    .set({
      title: baseDoc.title,
      slug: baseDoc.slug,
      author: baseDoc.author,
      categories: baseDoc.categories,
      excerpt: baseDoc.excerpt,
      body: baseDoc.body,
      publishedAt: baseDoc.publishedAt,
      featured: baseDoc.featured,
      seo: baseDoc.seo,
    })
    .commit()

  return created._id
}

;(async () => {
  try {
    const id = await createOrUpdatePost()
    console.log(`Published post with id: ${id}`)
    console.log(`Project: ${projectId}, Dataset: ${dataset}`)
  } catch (err) {
    console.error('Failed to publish Mesha post')
    console.error(err)
    process.exit(1)
  }
})()


