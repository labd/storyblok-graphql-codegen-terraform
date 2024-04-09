import gql from 'graphql-tag'
import { describe, expect, it } from 'vitest'
import { idResolvers } from './idResolvers'

describe('idResolvers', () => {
  const typeDefs = gql`
    type Article @storyblok {
      id: ID
    }
  `
  const resolvers = idResolvers(typeDefs.definitions)

  it('resolves the id', () => {
    const result = resolvers.Article.id({ _uid: '1' })
    expect(result).toBe('1')
  })
})
