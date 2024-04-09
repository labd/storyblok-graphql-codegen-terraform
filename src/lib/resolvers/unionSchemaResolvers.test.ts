import gql from 'graphql-tag'
import { describe, expect, it } from 'vitest'
import {
  unionArrayFieldResolvers,
  unionResolvers,
} from './unionSchemaResolvers'

describe('maps sb component values to __typename', () => {
  const typeDefs = gql`
    union Content = RichText | Video
    type RichText @storyblok {
      text: String @storyblokField
    }
    type Video @storyblok {
      id: String @storyblokField
    }
  `
  const resolvers = unionResolvers(typeDefs.definitions)

  it('returns the default if exists and empty string', () => {
    const result1 = resolvers.Content.__resolveType({
      component: 'rich_text',
    })
    expect(result1).toEqual('RichText')
  })
})

describe('unionArrayFieldResolvers', () => {
  const typeDefs = gql`
    union Content = RichText | Video
    type RichText @storyblok {
      text: String @storyblokField
    }
    type Video @storyblok {
      id: String @storyblokField
    }
    type Article @storyblok {
      top: Content @storyblokField
      content: [Content] @storyblokField
    }
  `
  const fieldResolvers = unionArrayFieldResolvers(typeDefs.definitions)

  it('filters out unknown union types', () => {
    const result1 = fieldResolvers.Article.top({
      top: [
        { component: 'rich_text', text: 'test' },
        { component: 'non_existing', foo: 'bar' },
      ],
    })
    const result2 = fieldResolvers.Article.content({
      content: [
        { component: 'rich_text', text: 'test' },
        { component: 'non_existing', foo: 'bar' },
      ],
    })
    expect(result1).toEqual([{ component: 'rich_text', text: 'test' }])
    expect(result2).toEqual([{ component: 'rich_text', text: 'test' }])
  })
})
