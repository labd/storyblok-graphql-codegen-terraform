import gql from 'graphql-tag'
import { describe, expect, it } from 'vitest'
import { assetResolvers } from './assetResolvers'

describe('assetResolvers', () => {
  const typeDefs = gql`
    type Article @storyblok {
      image: StoryblokAsset @storyblokField
      images: [StoryblokAsset] @storyblokField
    }
  `
  const resolvers = assetResolvers(typeDefs.definitions)

  it('returns undefined if no filename', () => {
    const result = resolvers.Article.image({ image: { filename: null } })
    expect(result).toBe(undefined)
  })

  it('returns the asset if a filename', () => {
    const result = resolvers.Article.image({ image: { filename: 'test.jpg' } })
    expect(result).toEqual({ filename: 'test.jpg' })
  })

  it('returns the asset list if there is a filename', () => {
    const result = resolvers.Article.images({
      images: [{ filename: 'test.jpg' }],
    })
    expect(result).toEqual([{ filename: 'test.jpg' }])
  })
})
