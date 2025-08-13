import { defineField, defineType } from 'sanity'

export const companySpotlight = defineType({
  name: 'companySpotlight',
  title: 'Company Spotlight',
  type: 'document',
  description: 'Companies featured in blog posts - can be synced with job portal data',
  fields: [
    defineField({
      name: 'name',
      title: 'Company Name',
      type: 'string',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'name',
        maxLength: 96,
      },
    }),
    defineField({
      name: 'logo',
      title: 'Logo',
      type: 'image',
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: 'website',
      title: 'Website',
      type: 'url',
    }),
    defineField({
      name: 'industry',
      title: 'Industry',
      type: 'string',
      options: {
        list: [
          'Technology',
          'Healthcare',
          'Finance',
          'E-commerce',
          'SaaS',
          'Education',
          'Media & Entertainment',
          'Travel & Hospitality',
          'Real Estate',
          'Other'
        ]
      }
    }),
    defineField({
      name: 'companySize',
      title: 'Company Size',
      type: 'string',
      options: {
        list: [
          '1-10',
          '11-50',
          '51-200',
          '201-500',
          '500+',
        ]
      }
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 4,
    }),
    defineField({
      name: 'marketingHighlights',
      title: 'Marketing Highlights',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'Key marketing strategies or achievements'
    }),
    defineField({
      name: 'jobPortalData',
      title: 'Job Portal Integration',
      type: 'object',
      description: 'Data synced from the job portal',
      fields: [
        {
          name: 'companyProfileId',
          title: 'Company Profile ID',
          type: 'string',
          description: 'ID from the job portal company_profiles table'
        },
        {
          name: 'activeJobs',
          title: 'Active Jobs Count',
          type: 'number',
          readOnly: true
        },
        {
          name: 'lastSynced',
          title: 'Last Synced',
          type: 'datetime',
          readOnly: true
        }
      ]
    }),
    defineField({
      name: 'featured',
      title: 'Featured Company',
      type: 'boolean',
      description: 'Show in featured companies section'
    })
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'industry',
      media: 'logo',
    },
  },
})




