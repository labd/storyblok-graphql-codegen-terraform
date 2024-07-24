import gql from 'graphql-tag'
import { describe, expect, it } from 'vitest'
import { ctVariantSKUResolvers } from './ctVariantSKUResolvers'

describe('ctVariantSKUResolvers', () => {
  const typeDefs = gql`
    type Article @storyblok {
      variantSku: String @storyblokField(ctType: variant)
      variantSkus: [String] @storyblokField(ctType: variant)
    }
  `
  const resolvers = ctVariantSKUResolvers(typeDefs.definitions)

  it('resolves a single Commercetools id', () => {
    const result = resolvers.Article.variantSku({
      variantSku: { items: [{ sku: '1' }] },
    })
    expect(result).toBe('1')
  })

  it('resolves a list of Commercetools id', () => {
    const result = resolvers.Article.variantSkus({
      variantSkus: { items: [{ sku: '1' }, { sku: '2' }] },
    })
    expect(result).toStrictEqual(['1', '2'])
  })
})
