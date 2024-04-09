import gql from 'graphql-tag'
import { describe, expect, it } from 'vitest'
import { ctTypeIdResolvers } from './ctTypeIdResolvers'

describe('ctTypeIdResolvers', () => {
  const typeDefs = gql`
    type Article @storyblok {
      categoryId: CtTypeId @storyblokField(ctType: category)
      productIds: [CtTypeId!] @storyblokField(ctType: product)
    }
  `
  const resolvers = ctTypeIdResolvers(typeDefs.definitions)

  it('resolves a single Commercetools id', () => {
    const result = resolvers.Article.categoryId({
      categoryId: { items: [{ id: '1' }] },
    })
    expect(result).toBe('1')
  })

  it('resolves a Commercetools id list', () => {
    const result = resolvers.Article.productIds({
      productIds: { items: [{ id: '1' }, { id: '2' }] },
    })
    expect(result).toEqual(['1', '2'])
  })
})
