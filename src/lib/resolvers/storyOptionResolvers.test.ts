import gql from 'graphql-tag'
import { describe, expect, it } from 'vitest'
import { storyOptionFieldResolvers } from './storyOptionResolvers'

describe('storyOptionResolvers', () => {
  const typeDefs = gql`
    type Article @storyblok {
      author: Author @storyblokField
      coAuthors: [Author] @storyblokField
    }
    type Author @storyblok(type: contentType) {
      name: String @storyblokField
    }
  `
  const resolvers = storyOptionFieldResolvers(typeDefs.definitions)

  it('resolves the story options from content', () => {
    const resultAuthor = resolvers.Article.author({
      author: { content: { name: 'test' } },
    })
    const resultCoAuthor = resolvers.Article.coAuthors({
      coAuthors: [
        { content: { name: 'test1' } },
        { content: { name: 'test2' } },
      ],
    })
    expect(resultAuthor.name).toBe('test')
    expect(resultCoAuthor[0].name).toBe('test1')
  })

  it('resolves the story options from context', () => {
    const resultAuthor = resolvers.Article.author({ author: '1' }, null, {
      rels: [{ uuid: '1', content: { name: 'test', _uid: '2' } }],
    })
    const resultCoAuthor = resolvers.Article.coAuthors(
      { coAuthors: ['1', '2'] },
      null,
      {
        rels: [
          { uuid: '1', content: { name: 'test1', _uid: '2' } },
          { uuid: '2', content: { name: 'test2', _uid: '2' } },
        ],
      }
    )
    expect(resultAuthor.name).toBe('test')
    expect(resultAuthor.id).toBe('2')
    expect(resultCoAuthor[0].name).toBe('test1')
    expect(resultCoAuthor[0].id).toBe('2')
  })
})
