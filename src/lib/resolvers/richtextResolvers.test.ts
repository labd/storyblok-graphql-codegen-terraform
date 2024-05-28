import { parse } from 'graphql'
import { describe, expect, it } from 'vitest'
import { richtextResolver, richtextResolvers } from './richtextResolvers'

describe('richtextResolvers', () => {
  it('should parse definition', () => {
    const field = parse(`
      type RichText @storyblok(componentGroup: "Content") {
        id: ID!
        content: String!
          @storyblokField(
            translatable: true
            format: richtext
            toolbar: [
              bold
              list
              paragraph
              h2
              h3
              italic
              blok
              link
              olist
              paste_action
              underline
            ]
            blokTypes: ["ButtonListBlock"]
          )
      }`)

    const resolvers = richtextResolvers(field.definitions as any)
    const fieldResolver = resolvers['RichText']['content']

    const data = {
      component: 'rich_text',
      content: {
        type: 'doc',
        content: [
          { type: 'paragraph', content: [{ type: 'text', text: 'x' }] },
        ],
      },
    }
    const result = fieldResolver(data)
    const expected = JSON.stringify({
      type: 'doc',
      content: [{ type: 'paragraph', content: [{ type: 'text', text: 'x' }] }],
    })

    expect(result).toEqual(expected)
  })
})

describe('richtextResolver', () => {
  it('should handle empty field', () => {
    const prop = 'content'
    const data = {
      component: 'rich_text',
      content: { type: 'doc', content: [{ type: 'paragraph' }] },
    }

    const expected = JSON.stringify({
      type: 'doc',
      content: [{ type: 'paragraph' }],
    })

    const result = richtextResolver(prop)(data)
    expect(result).toEqual(expected)
  })

  it('should serialize data to string', () => {
    const prop = 'content'
    const data = {
      component: 'rich_text',
      content: {
        type: 'doc',
        content: [
          { type: 'paragraph', content: [{ type: 'text', text: 'x' }] },
        ],
      },
    }
    const expected = JSON.stringify({
      type: 'doc',
      content: [{ type: 'paragraph', content: [{ type: 'text', text: 'x' }] }],
    })

    const result = richtextResolver(prop)(data)
    expect(result).toEqual(expected)
  })

  it('should resolve urls within rich text', () => {
    const prop = 'content'
    const data = {
      component: 'rich_text',
      content: {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              {
                text: 'This is a text with a ',
                type: 'text',
              },
              {
                text: 'link',
                type: 'text',
                marks: [
                  {
                    type: 'link',
                    attrs: {
                      // This URL should change:
                      href: '/wrong/url',
                      uuid: 'uuid-1234',
                      target: '_self',
                      linktype: 'story',
                    },
                  },
                ],
              },
              {
                text: ' to a page',
                type: 'text',
              },
            ],
          },
        ],
      },
    }

    const context = {
      links: [
        {
          uuid: 'uuid-1234',
          // This is the correct path, but the prefix should be replaced by the custom url resolver:
          full_slug: 'de/pages/good/path',
        },
      ],
    }

    const urlResolver = (fullSlug: string) =>
      '/nl/' + fullSlug.split('pages/')[1]

    const expected = JSON.stringify({
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              text: 'This is a text with a ',
              type: 'text',
            },
            {
              text: 'link',
              type: 'text',
              marks: [
                {
                  type: 'link',
                  attrs: {
                    // This should be the resolved URL:
                    href: '/nl/good/path',
                    uuid: 'uuid-1234',
                    target: '_self',
                    linktype: 'story',
                  },
                },
              ],
            },
            {
              text: ' to a page',
              type: 'text',
            },
          ],
        },
      ],
    })

    const result = richtextResolver(prop, urlResolver)(data, {}, context)
    expect(result).toEqual(expected)
  })
})
