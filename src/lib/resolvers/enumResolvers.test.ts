import gql from 'graphql-tag'
import { describe, expect, it } from 'vitest'
import { enumResolvers } from './enumResolvers'

describe('enumResolvers', () => {
  const typeDefs = gql`
    enum ArticleIcon {
      NEWS
      BLOG
      EVENT
    }
    type Article @storyblok {
      icon: ArticleIcon @storyblokField(default: "NEWS")
      requiredIcon: ArticleIcon! @storyblokField(default: "NEWS")
      iconNoDefault: ArticleIcon @storyblokField
    }
  `
  const resolvers = enumResolvers(typeDefs.definitions)

  it('resolves an enum if it has a value', () => {
    const result1 = resolvers.Article.icon({
      icon: 'BLOG',
    })
    const result2 = resolvers.Article.requiredIcon({
      requiredIcon: 'BLOG',
    })
    const result3 = resolvers.Article.iconNoDefault({
      iconNoDefault: 'BLOG',
    })
    expect(result1).toBe('BLOG')
    expect(result2).toBe('BLOG')
    expect(result3).toBe('BLOG')
  })

  it('returns the default if exists and empty string', () => {
    const result1 = resolvers.Article.icon({
      icon: '',
    })
    const result2 = resolvers.Article.requiredIcon({
      requiredIcon: '',
    })
    expect(result1).toBe('NEWS')
    expect(result2).toBe('NEWS')
  })

  it('returns the default if exists and undefined value ', () => {
    const result1 = resolvers.Article.icon({})
    const result2 = resolvers.Article.requiredIcon({})
    expect(result1).toBe('NEWS')
    expect(result2).toBe('NEWS')
  })

  it('returns undefined if no default and empty string ', () => {
    const result3 = resolvers.Article.iconNoDefault({
      iconNoDefault: '',
    })
    expect(result3).toBe(undefined)
  })
})
