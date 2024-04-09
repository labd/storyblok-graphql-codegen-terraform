import gql from 'graphql-tag'
import { describe, expect, it } from 'vitest'
import { ctCategoryKeyResolvers } from './ctCategoryKeyResolvers'

describe('ctCategoryKeyResolvers', () => {
  const typeDefs = gql`
    type Article @storyblok {
      categoryKey: String @storyblokField(ctType: category)
    }
  `
  const resolvers = ctCategoryKeyResolvers(typeDefs.definitions)

  it('resolves a single Commercetools id', () => {
    const result = resolvers.Article.categoryKey({
      categoryKey: { key: '1' },
    })
    expect(result).toBe('1')
  })
})
