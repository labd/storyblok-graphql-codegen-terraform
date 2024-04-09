import gql from 'graphql-tag'
import { expect, it } from 'vitest'
import { storyblokResolvers } from './resolvers'

it('combines resolvers', () => {
  const typeDefs = gql`
    type Ignore {
      name: String
    }
    type Article @storyblok {
      id: ID!
      url: StoryblokLink @storyblokField
      richtext: String @storyblokField(format: richtext)
      noSpecialResolver: String @storyblokField
      ignored: String
      ignoredType: Ignore
      asset: StoryblokAsset @storyblokField
    }
  `

  const result = storyblokResolvers(typeDefs)

  // we expect these resolvers
  expect(result.Article.id).toBeDefined()
  expect(result.Article.url).toBeDefined()
  expect(result.Article.richtext).toBeDefined()
  expect(result.Article.asset).toBeDefined()

  // we expect no resolvers for these fields
  expect(result.Article.noSpecialResolver).not.toBeDefined()
  expect(result.Article.ignored).not.toBeDefined()
  expect(result.Article.ignoredType).not.toBeDefined()
})
