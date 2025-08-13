import pg from 'pg'
import { client as sanityClient } from '@/lib/sanity'
import OpenAI from 'openai'

// Types describing external job items
type IndeedItem = {
  title?: string
  isRemote?: boolean
  jobType?: string[]
  companyName?: string
  companyUrl?: string
  companyLogoUrl?: string
  location?: { formattedAddressShort?: string; city?: string } | string
  descriptionText?: string
  descriptionHtml?: string
  salary?: { salaryMin?: number; salaryMax?: number; salaryCurrency?: string; salaryText?: string } | null
  jobUrl?: string
  applyUrl?: string
  jobKey?: string
  datePublished?: string
  occupation?: string[]
  attributes?: string[]
}

type WellfoundItem = {
  id: string
  title: string
  company_name?: string
  company_logo_url?: string
  remote?: boolean
  job_type?: string
  location_names?: string[]
  compensation_parsed?: { base_salary?: { min_value?: number; max_value?: number; currency?: string } } | null
  description?: string
  url?: string
  live_start_at?: number | null
}

export class JobsIngestService {
  static async fetchIndeed(params: Record<string, unknown>, limit = 5): Promise<IndeedItem[]> {
    const token = process.env.APIFY_TOKEN
    if (!token) throw new Error('Missing APIFY_TOKEN')
    const endpoint = `https://api.apify.com/v2/acts/borderline~indeed-scraper/run-sync-get-dataset-items?token=${encodeURIComponent(token)}`
    // Allow explicit params (e.g., maxRows) to override defaults; keep data fresh with fromDays default
    const fromDays = typeof (params as { fromDays?: unknown })?.fromDays === 'string'
      ? (params as { fromDays?: string }).fromDays
      : 3
    const body = JSON.stringify({ maxRows: limit, maxRowsPerUrl: limit, ...params, fromDays })
    const res = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body })
    if (!res.ok) {
      const text = await res.text().catch(() => '')
      throw new Error(`Indeed fetch failed: ${res.status}${text ? ` - ${text.substring(0, 500)}` : ''}`)
    }
    return (await res.json()) as IndeedItem[]
  }

  static async fetchWellfound(params: Record<string, unknown>, limit = 5): Promise<WellfoundItem[]> {
    const token = process.env.APIFY_TOKEN
    if (!token) throw new Error('Missing APIFY_TOKEN')
    const endpoint = `https://api.apify.com/v2/acts/clearpath~wellfound-api-job-scraper/run-sync-get-dataset-items?token=${encodeURIComponent(token)}`
    const body = JSON.stringify({ ...params, pageLimit: 1 })
    const res = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body })
    if (!res.ok) throw new Error(`Wellfound fetch failed: ${res.status}`)
    const items = (await res.json()) as WellfoundItem[]
    return items.slice(0, limit)
  }

  static mapIndeed(item: IndeedItem) {
    return {
      source: 'indeed',
      external_id: item.jobKey || item.jobUrl || '',
      title: item.title || 'Untitled',
      company_name: item.companyName || null,
      company_url: item.companyUrl || null,
      company_logo_url: item.companyLogoUrl || null,
      location: typeof item.location === 'object'
        ? (item.location?.formattedAddressShort || (item.location as { city?: string })?.city)
        : (item.location || null),
      is_remote: !!item.isRemote,
      job_type: Array.isArray(item.jobType) ? item.jobType.join(',') : (item.jobType || null),
      salary_min: item.salary?.salaryMin ? Math.round(item.salary.salaryMin) : null,
      salary_max: item.salary?.salaryMax ? Math.round(item.salary.salaryMax) : null,
      salary_currency: item.salary?.salaryCurrency || 'USD',
      compensation: item.salary?.salaryText || null,
      experience_level: null,
      category: item.occupation?.[0] || null,
      skills: item.attributes || [],
      description: item.descriptionText || null,
      description_html: item.descriptionHtml || null,
      apply_url: item.applyUrl || item.jobUrl || null,
      job_url: item.jobUrl || null,
      posted_at: item.datePublished ? new Date(item.datePublished).toISOString() : null,
      raw: item as unknown as Record<string, unknown>,
    }
  }

  static mapWellfound(item: WellfoundItem) {
    const baseSalary = item.compensation_parsed?.base_salary
    return {
      source: 'wellfound',
      external_id: item.id,
      title: item.title || 'Untitled',
      company_name: item.company_name || null,
      company_url: null,
      company_logo_url: item.company_logo_url || null,
      location: item.location_names?.[0] || null,
      is_remote: !!item.remote,
      job_type: item.job_type || null,
      salary_min: baseSalary?.min_value ? Math.round(baseSalary.min_value) : null,
      salary_max: baseSalary?.max_value ? Math.round(baseSalary.max_value) : null,
      salary_currency: baseSalary?.currency || 'USD',
      compensation: null,
      experience_level: null,
      category: null,
      skills: [],
      description: item.description || null,
      description_html: null,
      apply_url: item.url || null,
      job_url: item.url || null,
      posted_at: item.live_start_at ? new Date(item.live_start_at * 1000).toISOString() : null,
      raw: item as unknown as Record<string, unknown>,
    }
  }

  static async upsertJobs(rows: ReturnType<typeof JobsIngestService.mapIndeed>[]) {
    const dbUrl = process.env.SUPABASE_DB_URL
    if (!dbUrl) throw new Error('Missing SUPABASE_DB_URL')
    const client = new pg.Client({ connectionString: dbUrl })
    await client.connect()
    try {
      // Track companies seen in this batch (for SEO blog autoposts)
      const companyToSampleRow = new Map<string, {
        company_name: string | null
        company_url: string | null
        company_logo_url: string | null
        title: string
        location: string | null
        job_type: string | null
        salary_min: number | null
        salary_max: number | null
        salary_currency: string | null
        description: string | null
        apply_url: string | null
      }>()
      for (const r of rows) {
        await client.query(
          `INSERT INTO external_jobs (
            source, external_id, title, company_name, company_url, company_logo_url,
            location, is_remote, job_type, salary_min, salary_max, salary_currency,
            compensation, experience_level, category, skills, description, description_html,
            apply_url, job_url, posted_at, raw
          ) VALUES (
            $1,$2,$3,$4,$5,$6,
            $7,$8,$9,$10,$11,$12,
            $13,$14,$15,$16,$17,$18,
            $19,$20,$21,$22
          )
          ON CONFLICT (source, external_id) DO UPDATE SET
            title=EXCLUDED.title,
            company_name=EXCLUDED.company_name,
            company_url=EXCLUDED.company_url,
            company_logo_url=EXCLUDED.company_logo_url,
            location=EXCLUDED.location,
            is_remote=EXCLUDED.is_remote,
            job_type=EXCLUDED.job_type,
            salary_min=EXCLUDED.salary_min,
            salary_max=EXCLUDED.salary_max,
            salary_currency=EXCLUDED.salary_currency,
            compensation=EXCLUDED.compensation,
            experience_level=EXCLUDED.experience_level,
            category=EXCLUDED.category,
            skills=EXCLUDED.skills,
            description=EXCLUDED.description,
            description_html=EXCLUDED.description_html,
            apply_url=EXCLUDED.apply_url,
            job_url=EXCLUDED.job_url,
            posted_at=EXCLUDED.posted_at,
            raw=EXCLUDED.raw,
            updated_at=NOW()
          RETURNING (xmax = 0) AS inserted, company_name, company_url, company_logo_url, title, location, job_type, salary_min, salary_max, salary_currency, description, apply_url;
          `,
          [
            r.source,
            r.external_id,
            r.title,
            r.company_name,
            r.company_url,
            r.company_logo_url,
            r.location,
            r.is_remote,
            r.job_type,
            r.salary_min,
            r.salary_max,
            r.salary_currency,
            r.compensation,
            r.experience_level,
            r.category,
            (r.skills || []) as unknown as string[],
            r.description,
            r.description_html,
            r.apply_url,
            r.job_url,
            r.posted_at ? new Date(r.posted_at) : null,
            r.raw,
          ]
        )
        // Track sample row for company regardless of insert/update; we'll de-duplicate against Sanity
        if (r.company_name && !companyToSampleRow.has(r.company_name)) {
          companyToSampleRow.set(r.company_name, {
            company_name: r.company_name,
            company_url: r.company_url,
            company_logo_url: r.company_logo_url,
            title: r.title,
            location: r.location ?? null,
            job_type: r.job_type,
            salary_min: r.salary_min,
            salary_max: r.salary_max,
            salary_currency: r.salary_currency,
            description: r.description,
            apply_url: r.apply_url,
          })
        }
      }

      // After DB upserts, optionally create Sanity blog posts for new companies
      const uniqueCompanies = companyToSampleRow.size
      const createdPosts = await JobsIngestService.ensureCompanyIntroPosts([...companyToSampleRow.values()])
      return { uniqueCompanies, createdPosts }
    } finally {
      await client.end()
    }
  }

  private static toSlug(value: string): string {
    return String(value)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
  }

  private static async ensureSanityAuthor() {
    const name = '100x Marketers Team'
    const slug = JobsIngestService.toSlug(name)
    const existing = await sanityClient.fetch('*[_type=="author" && slug.current==$slug][0]', { slug })
    if (existing) return existing
    return sanityClient.create({ _type: 'author', name, slug: { current: slug }, role: 'editor' })
  }

  private static async ensureSanityCategory() {
    const title = 'Company Spotlights'
    const slug = JobsIngestService.toSlug(title)
    const existing = await sanityClient.fetch('*[_type=="category" && slug.current==$slug][0]', { slug })
    if (existing) return existing
    return sanityClient.create({ _type: 'category', title, slug: { current: slug }, description: 'Auto-generated company overview posts' })
  }

  private static buildCompanyPostBody(sample: {
    company_name: string | null
    location: string | null
    job_type: string | null
    salary_min: number | null
    salary_max: number | null
    salary_currency: string | null
    description: string | null
    company_url?: string | null
    apply_url?: string | null
  }) {
    const rows: Array<Record<string, unknown>> = []
    if (sample.company_name) {
      rows.push({ _type: 'block', style: 'h2', markDefs: [], children: [{ _type: 'span', text: sample.company_name }] })
    }
    const bullets: string[] = []
    if (sample.location) bullets.push(`Location: ${sample.location}`)
    if (sample.job_type) bullets.push(`Role type: ${sample.job_type}`)
    if (sample.salary_min || sample.salary_max) bullets.push(`Compensation: ${sample.salary_min ? `$${sample.salary_min.toLocaleString()}` : ''}${sample.salary_min && sample.salary_max ? ' - ' : ''}${sample.salary_max ? `$${sample.salary_max.toLocaleString()}` : ''} ${sample.salary_currency || ''}`.trim())
    if (bullets.length) {
      rows.push({ _type: 'block', style: 'normal', markDefs: [], children: [{ _type: 'span', text: 'At-a-glance:' }] })
      rows.push({ _type: 'block', style: 'normal', listItem: 'bullet', level: 1, markDefs: [], children: [{ _type: 'span', text: bullets[0] }] })
      for (let i = 1; i < bullets.length; i++) {
        rows.push({ _type: 'block', style: 'normal', listItem: 'bullet', level: 1, markDefs: [], children: [{ _type: 'span', text: bullets[i] }] })
      }
    }
    if (sample.description) {
      rows.push({ _type: 'block', style: 'h3', markDefs: [], children: [{ _type: 'span', text: 'About the role' }] })
      rows.push({ _type: 'block', style: 'normal', markDefs: [], children: [{ _type: 'span', text: sample.description.slice(0, 1000) }] })
    }
    if (sample.company_url || sample.apply_url) {
      rows.push({ _type: 'block', style: 'normal', markDefs: [], children: [{ _type: 'span', text: 'Links:' }] })
      if (sample.company_url) rows.push({ _type: 'block', style: 'normal', markDefs: [{ _key: 'm1', _type: 'link', href: sample.company_url }], children: [{ _type: 'span', marks: ['m1'], text: 'Company Website' }] })
      if (sample.apply_url) rows.push({ _type: 'block', style: 'normal', markDefs: [{ _key: 'm2', _type: 'link', href: sample.apply_url }], children: [{ _type: 'span', marks: ['m2'], text: 'Apply Link' }] })
    }
    return rows
  }

  private static async ensureCompanyIntroPosts(samples: Array<{
    company_name: string | null
    company_url: string | null
    company_logo_url: string | null
    title: string
    location: string | null
    job_type: string | null
    salary_min: number | null
    salary_max: number | null
    salary_currency: string | null
    description: string | null
    apply_url: string | null
  }>) {
    // Skip if Sanity is not configured
    if (!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || process.env.NEXT_PUBLIC_SANITY_PROJECT_ID === 'dummy-project-id' || !process.env.SANITY_API_TOKEN) {
      return 0
    }
    const author = await JobsIngestService.ensureSanityAuthor()
    const category = await JobsIngestService.ensureSanityCategory()

    let createdCount = 0
    const openaiKey = process.env.OPENAI_API_KEY
    const useOpenAI = !!openaiKey
    const openai = useOpenAI ? new OpenAI({ apiKey: openaiKey }) : null
    for (const sample of samples) {
        const name: string | null = sample.company_name
      if (!name) continue
      const slug = `company-${JobsIngestService.toSlug(name)}`

      const existing = await sanityClient.fetch('*[_type=="blogPost" && slug.current==$slug][0]', { slug })
      if (existing) continue

      const position = (sample.title || '').trim()
      const title = position ? `${name} is Hiring for ${position}` : `${name} is Hiring`
      const excerpt = position ? `${name} is hiring for ${position}.` : `${name} is hiring.`

      // Generate rich, SEO-formatted body via GPT-5 if available; fallback to basic body
      let body = JobsIngestService.buildCompanyPostBody(sample)
      if (openai) {
        try {
          const prompt = `You are an expert B2B content marketer and SEO strategist. Convert the following raw job data into a polished, structured blog article optimized for SEO and readability.

Goals:
- Title case headings, concise paragraphs, and scannable bullet points
- Include a clear company overview, role summary, responsibilities, ideal profile, compensation/location, and how to apply
- Add a short intro and a concise conclusion with CTA
- Use neutral, professional tone; avoid overhyping; no made-up facts
- Respect provided links; never fabricate URLs
- Keep total length 500-900 words

Brand integration (required, relevant, subtle):
- Brand: Mesha — visit https://trymesha.com
- Positioning: Mesha is a hub for ambitious marketers with playbooks, company spotlights, and curated roles.
- Include a brief, relevant "About Mesha" or closing CTA (1–2 sentences) that naturally fits the post, e.g. inviting readers to explore Mesha resources or roles.
- Use at most one link to https://trymesha.com and, only if contextually appropriate for jobs, a second link to https://trymesha.com/jobs. Do not fabricate other Mesha URLs.

Output: Sanity Portable Text JSON array (blockContent). Use only supported types: block paragraphs, h2/h3 headings, bullet lists, and simple link marks.

RAW JSON:
${JSON.stringify(sample, null, 2)}
`
          const resp = await openai.responses.create({
            model: 'gpt-5',
            instructions: 'Return ONLY valid Sanity Portable Text array JSON. No prose before/after.',
            input: prompt,
          })
          const text = (resp as unknown as { output_text?: string })?.output_text?.trim() || ''
          const parsed = JSON.parse(text)
          if (Array.isArray(parsed)) body = parsed
        } catch {}
      }

      // Try to upload company logo as mainImage if available
      let mainImage: { _type: 'image'; asset: { _type: 'reference'; _ref: string }; alt?: string } | undefined
      if (sample.company_logo_url) {
        try {
          const logoUrl: string = sample.company_logo_url
          const resp = await fetch(logoUrl)
          if (resp.ok) {
            const contentType = resp.headers.get('content-type') || undefined
            const ab = await resp.arrayBuffer()
            const buffer = Buffer.from(ab)
            const asset = await (sanityClient as unknown as { assets: { upload: (type: 'image', data: Buffer, opts?: { filename?: string; contentType?: string }) => Promise<{ _id: string }> } }).assets.upload('image', buffer, {
              filename: `${JobsIngestService.toSlug(name)}-logo`,
              contentType,
            })
            if (asset?._id) {
              mainImage = {
                _type: 'image',
                asset: { _type: 'reference', _ref: asset._id },
                alt: `${name} logo`,
              }
            }
          }
        } catch {}
      }

      await sanityClient.create({
        _type: 'blogPost',
        title,
        slug: { current: slug },
        author: { _type: 'reference', _ref: author._id },
        categories: [{ _type: 'reference', _ref: category._id }],
        ...(mainImage ? { mainImage } : {}),
        excerpt,
        body,
        publishedAt: new Date().toISOString(),
        featured: false,
        seo: {
          metaTitle: title,
          metaDescription: `${excerpt} ${sample.location ? `Location: ${sample.location}. ` : ''}`.trim().slice(0, 155),
        },
      })
      createdCount++
    }
    return createdCount
  }
}


