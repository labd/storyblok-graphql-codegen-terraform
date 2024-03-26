import { FieldDefinitionNode, ObjectTypeDefinitionNode } from 'graphql'
import { findDefinition, isArray, isRoot } from '../graphql'
import { ifValue } from '../value'

/**
 * Returns resolver structures for resolving story option fields.
 *
 * These are fields defined by GraphQL that refer to a single or multiple Storyblok **content type**.
 * This will be implemented as a single or multiple option field that by default only returns the ID or IDs of the referenced story or stories.
 * This resolver will get the full story from the `refs` object returned by the api which is assumed to be set in the context.
 * To retrieve the `refs` object, you need to do a request with the `resolve_relations=1` parameter.
 *
 * @example
 * ```graphql
 * type Article@storyblok {
 *   author: Author@storyblokField
 *   coAuthors: [Author]@storyblokField
 * }
 * type Author@storyblok(type: contentType) {
 *   ...
 * }
 * ```
 * ```ts
 * // result looks something like this:
 * const resolvers = {
 *   Article: {
 *     author: (parent, context) => context.refs.find(r => r.uuid === parent.author),
 *     coAuthors: (parent, context) => parent.coAuthors.map(uuid => context.refs.find(r => r.uuid === uuid)),
 *   }
 * }
 * ```
 */
export const storyOptionFieldResolvers = (
  definitions: ObjectTypeDefinitionNode[]
) =>
  Object.fromEntries(
    definitions
      .filter(hasStoryOptionFields(definitions))
      .map((node) => [
        node.name.value,
        Object.fromEntries(
          node.fields
            ?.filter(isStoryOptionField(definitions))
            .map((field) => [
              field.name.value,
              isArray(field.type)
                ? storyOptionsResolver(field.name.value)
                : storyOptionResolver(field.name.value),
            ]) ?? []
        ),
      ])
  )

const hasStoryOptionFields =
  (definitions: ObjectTypeDefinitionNode[]) =>
  (node: ObjectTypeDefinitionNode) =>
    !['Query'].includes(node.name.value) &&
    node.fields?.some(isStoryOptionField(definitions))

const isStoryOptionField =
  (definitions: ObjectTypeDefinitionNode[]) => (field: FieldDefinitionNode) =>
    ifValue(findDefinition(definitions, field.type), isRoot)

type Rel = {
  uuid: string
  [others: string]: any
}

const storyOptionResolver =
  (prop: string) => (parent: any, _args?: any, context?: { rels?: Rel[] }) =>
    parent[prop].content ??
    context?.rels
      ?.filter((r) => r.uuid === parent[prop])
      .map((r) => ({ ...r.content, id: r.content._uid }))[0]

const storyOptionsResolver =
  (prop: string) => (parent: any, _args?: any, context?: { rels?: Rel[] }) => {
    const value = parent[prop]
    if (!value) return []

    // TODO: Rewrite this to be more readable
    return value.length === 0
      ? []
      : value[0]?.content
      ? value.map((f: { content: object }) => f.content)
      : value.map(
          (uuid: string) =>
            context?.rels
              ?.filter((r) => r.uuid === uuid)
              .map((r) => ({ ...r.content, id: r.content._uid }))[0]
        )
  }
