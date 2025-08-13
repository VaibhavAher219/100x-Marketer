import { defineType, defineArrayMember } from 'sanity'

export const blockContent = defineType({
  title: 'Block Content',
  name: 'blockContent',
  type: 'array',
  of: [
    defineArrayMember({
      title: 'Block',
      type: 'block',
      styles: [
        { title: 'Normal', value: 'normal' },
        { title: 'H1', value: 'h1' },
        { title: 'H2', value: 'h2' },
        { title: 'H3', value: 'h3' },
        { title: 'H4', value: 'h4' },
        { title: 'Quote', value: 'blockquote' },
      ],
      lists: [
        { title: 'Bullet', value: 'bullet' },
        { title: 'Numbered', value: 'number' }
      ],
      marks: {
        decorators: [
          { title: 'Strong', value: 'strong' },
          { title: 'Emphasis', value: 'em' },
          { title: 'Code', value: 'code' },
        ],
        annotations: [
          {
            title: 'URL',
            name: 'link',
            type: 'object',
            fields: [
              {
                title: 'URL',
                name: 'href',
                type: 'url',
              },
              {
                title: 'Open in new tab',
                name: 'blank',
                type: 'boolean'
              }
            ],
          },
          {
            title: 'Company Link',
            name: 'companyLink',
            type: 'object',
            fields: [
              {
                title: 'Company',
                name: 'company',
                type: 'reference',
                to: { type: 'companySpotlight' }
              }
            ]
          }
        ],
      },
    }),
    defineArrayMember({
      type: 'image',
      options: { hotspot: true },
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Alternative Text',
        }
      ]
    }),
    defineArrayMember({
      type: 'object',
      name: 'callout',
      title: 'Callout',
      fields: [
        {
          name: 'type',
          title: 'Type',
          type: 'string',
          options: {
            list: [
              { title: 'Info', value: 'info' },
              { title: 'Warning', value: 'warning' },
              { title: 'Success', value: 'success' },
              { title: 'Error', value: 'error' },
            ]
          }
        },
        {
          name: 'content',
          title: 'Content',
          type: 'text'
        }
      ]
    }),
    defineArrayMember({
      type: 'object',
      name: 'jobsWidget',
      title: 'Jobs Widget',
      description: 'Display related jobs from the job portal',
      fields: [
        {
          name: 'title',
          title: 'Widget Title',
          type: 'string',
          initialValue: 'Related Opportunities'
        },
        {
          name: 'category',
          title: 'Job Category',
          type: 'string',
          options: {
            list: [
              { title: 'Growth Marketing', value: 'growth-marketing' },
              { title: 'Performance Marketing', value: 'performance-marketing' },
              { title: 'Content Marketing', value: 'content-marketing' },
              { title: 'All Marketing Jobs', value: 'all' },
            ]
          }
        },
        {
          name: 'limit',
          title: 'Number of Jobs',
          type: 'number',
          initialValue: 3,
          validation: Rule => Rule.min(1).max(10)
        }
      ]
    })
  ],
})




