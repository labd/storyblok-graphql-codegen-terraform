import gql from 'graphql-tag'
import { describe, expect, it } from 'vitest'
import { linkResolvers } from './linkResolvers'

describe('linkResolvers', () => {
  const typeDefs = gql`
    type Article @storyblok {
      url: StoryblokLink @storyblokField
    }
  `
  const resolvers = linkResolvers(typeDefs.definitions)

  it('resolves an external url', () => {
    const result = resolvers.Article.url({
      url: { url: 'https://example.com/article/test-article#test-hash' },
    })
    expect(result?.url).toBe(
      'https://example.com/article/test-article#test-hash'
    )
    expect(result?.hash).toBe('test-hash')
    expect(result?.pathname).toBe('/article/test-article')
    expect(result?.type).toBe('external')
    expect(result?.newTab).toBe(true)
  })

  it('can overwrite the newTab to false for external urls', () => {
    const result = resolvers.Article.url({
      url: { url: 'https://example.com', target: '_self' },
    })
    expect(result?.newTab).toBe(false)
  })

  it('resolves an internal url with cached_url', () => {
    const result = resolvers.Article.url({
      url: {
        id: '1',
        linktype: 'story',
        cached_url: 'https://www.example.com/article/test-article',
        anchor: 'test-hash',
      },
    })
    expect(result?.url).toBe('/article/test-article#test-hash')
    expect(result?.pathname).toBe('/article/test-article')
    expect(result?.hash).toBe('test-hash')
    expect(result?.type).toBe('internal')
    expect(result?.newTab).toBe(false)
  })

  it('resolves an internal url with `links` in context', () => {
    const result = resolvers.Article.url(
      { url: { id: '1', linktype: 'story', anchor: 'test-hash' } },
      null,
      { links: [{ uuid: '1', full_slug: '/article/test-article' }] }
    )
    expect(result?.url).toBe('/article/test-article#test-hash')
    expect(result?.hash).toBe('test-hash')
    expect(result?.pathname).toBe('/article/test-article')
    expect(result?.type).toBe('internal')
    expect(result?.newTab).toBe(false)
  })

  it('ignores an internal url with `links` in context if the link does not exist', () => {
    const result = resolvers.Article.url(
      { url: { id: '1', linktype: 'story', anchor: 'test-hash' } },
      null,
      { links: [] }
    )
    expect(result).toBe(undefined)
  })

  it('can overwrite the newTab to true for an internal url', () => {
    const result = resolvers.Article.url(
      { url: { id: '1', linktype: 'story', target: '_blank' } },
      null,
      { links: [{ uuid: '1', full_slug: '/article/test-article' }] }
    )
    expect(result?.newTab).toBe(true)
  })

  it('can resolve a slug url', () => {
    const resolvers = linkResolvers(typeDefs.definitions, (fullSlug) =>
      fullSlug.replace('/article/', '/artikel/')
    )

    const result = resolvers.Article.url(
      { url: { id: '1', linktype: 'story', slug: 'test-article' } },
      null,
      { links: [{ uuid: '1', full_slug: '/article/test-article' }] }
    )

    expect(result?.url).toBe('/artikel/test-article')
  })

  // TODO: test email and asset links
})
