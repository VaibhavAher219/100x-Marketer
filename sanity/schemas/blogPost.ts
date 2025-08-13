import { defineField, defineType } from 'sanity'

export const blogPost = defineType({
  name: 'blogPost',
  title: 'Blog Post',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'author',
      title: 'Author',
      type: 'reference',
      to: { type: 'author' },
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'mainImage',
      title: 'Main image',
      type: 'image',
      options: {
        hotspot: true,
      },
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Alternative Text',
        }
      ]
    }),
    defineField({
      name: 'categories',
      title: 'Categories',
      type: 'array',
      of: [{ type: 'reference', to: { type: 'category' } }],
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published at',
      type: 'datetime',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'excerpt',
      title: 'Excerpt',
      type: 'text',
      rows: 4,
      validation: Rule => Rule.max(200)
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'blockContent',
    }),
    defineField({
      name: 'featuredCompanies',
      title: 'Featured Companies',
      type: 'array',
      of: [{ type: 'reference', to: { type: 'companySpotlight' } }],
      description: 'Companies mentioned or featured in this post'
    }),
    defineField({
      name: 'relatedJobs',
      title: 'Related Job Categories',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        list: [
          { title: 'Growth Marketing', value: 'growth-marketing' },
          { title: 'Performance Marketing', value: 'performance-marketing' },
          { title: 'Content Marketing', value: 'content-marketing' },
          { title: 'Social Media Marketing', value: 'social-media-marketing' },
          { title: 'Email Marketing', value: 'email-marketing' },
          { title: 'SEO/SEM', value: 'seo-sem' },
          { title: 'Product Marketing', value: 'product-marketing' },
          { title: 'Marketing Analytics', value: 'marketing-analytics' },
        ]
      }
    }),
    defineField({
      name: 'seo',
      title: 'SEO',
      type: 'object',
      fields: [
        {
          name: 'metaTitle',
          title: 'Meta Title',
          type: 'string',
          validation: Rule => Rule.max(60)
        },
        {
          name: 'metaDescription',
          title: 'Meta Description',
          type: 'text',
          rows: 3,
          validation: Rule => Rule.max(160)
        }
      ]
    }),
    defineField({
      name: 'featured',
      title: 'Featured Post',
      type: 'boolean',
      description: 'Mark as featured to show on homepage'
    })
  ],
  preview: {
    select: {
      title: 'title',
      author: 'author.name',
      media: 'mainImage',
    },
    prepare(selection) {
      const { author } = selection
      return { ...selection, subtitle: author && `by ${author}` }
    },
  },
})




