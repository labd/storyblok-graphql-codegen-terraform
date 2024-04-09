import gql from 'graphql-tag'
import { describe, expect, it } from 'vitest'
import { singleBlokFieldResolvers } from './singleBlokResolvers'

describe('singleBlokResolvers', () => {
  const typeDefs = gql`
    type Author @storyblok {
      name: String
    }
    type Article @storyblok {
      author: Author @storyblokField
    }
  `
  const resolvers = singleBlokFieldResolvers(typeDefs.definitions)

  it('resolves a single blok', () => {
    const result = resolvers.Article.author({ author: [{ name: 'test' }] })
    expect(result).toEqual({ name: 'test' })
  })
})
