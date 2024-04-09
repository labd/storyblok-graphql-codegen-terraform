import gql from 'graphql-tag'
import { describe, expect, it } from 'vitest'
import { ctCategoryIdResolvers } from './ctCategoryIdResolvers'

describe('ctCategoryIdResolvers', () => {
  const typeDefs = gql`
    type Article @storyblok {
      categoryId: String @storyblokField(ctType: category)
    }
  `
  const resolvers = ctCategoryIdResolvers(typeDefs.definitions)

  it('resolves a single Commercetools id', () => {
    const result = resolvers.Article.categoryId({
      categoryId: { id: '1' },
    })
    expect(result).toBe('1')
  })
})
