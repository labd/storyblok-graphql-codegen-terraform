import gql from 'graphql-tag'
import { describe, expect, it } from 'vitest'
import { tableResolvers } from './tableResolvers'

describe('tableResolvers', () => {
  const typeDefs = gql`
    type Article @storyblok {
      table: StoryblokTable @storyblokField
    }
  `

  const resolvers = tableResolvers(typeDefs.definitions)

  it('resolves a single Commercetools id', () => {
    const result = resolvers.Article.table({
      table: {
        tbody: [
          {
            _uid: '1',
            body: [
              {
                _uid: '1',
                value: 'Value 1,1',
                component: '_table_col',
              },
            ],
            component: '_table_row',
          },
        ],
        thead: [
          {
            _uid: '1',
            value: 'Heading 1',
            component: '_table_head',
          },
        ],
        fieldtype: 'table',
      },
    })
    expect(result.thead).toEqual(['Heading 1'])
    expect(result.tbody).toEqual([['Value 1,1']])
  })
})
