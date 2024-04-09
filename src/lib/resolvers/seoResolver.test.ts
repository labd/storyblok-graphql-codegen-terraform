import gql from 'graphql-tag'
import { describe, expect, it } from 'vitest'
import { isObjectTypeDefinitionNode } from '../graphql'
import { seoResolvers } from './seoResolver'

describe('seoResolvers', () => {
  const typeDefs = gql`
    type Article @storyblok {
      seo: StoryblokSeo @storyblokField
    }
  `
  const resolvers = seoResolvers(
    typeDefs.definitions.filter(isObjectTypeDefinitionNode)
  )

  it('resolves the seo field', () => {
    const result = resolvers.Article.seo({
      seo: {
        _uid: '1',
        title: 'test',
        description: 'test',
        og_title: 'test',
        og_description: 'test',
        og_image: 'test',
        twitter_title: 'test',
        twitter_description: 'test',
        twitter_image: 'test',
      },
    })

    expect(result).toHaveProperty('title')
    expect(result).toHaveProperty('description')
    expect(result).toHaveProperty('ogTitle')
    expect(result).toHaveProperty('ogDescription')
    expect(result).toHaveProperty('ogImage')
    expect(result).toHaveProperty('twitterTitle')
    expect(result).toHaveProperty('twitterDescription')
    expect(result).toHaveProperty('twitterImage')
  })
})
