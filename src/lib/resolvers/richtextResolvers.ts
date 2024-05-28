import {
  EnumValueNode,
  FieldDefinitionNode,
  ObjectTypeDefinitionNode,
} from 'graphql'
import { findStoryblokFieldValue, isArray, typeName } from '../graphql'
import { recursivelyModifyObjects } from '../object'
import { LinksContext, UrlResolver } from './linkResolvers'

/**
 * Returns resolver structures for resolving richtext fields.
 *
 * Storyblok returns rich text as a dynamic json object, but we simplify it a as a serialized string.
 * This is because it does not make sense to partially retrieve the rich text json,
 * so therefore you would otherwise need a very exhaustive and complete query.
 *
 * Furthermore, we resolve all links in the richtext to the full_slug of the linked story.
 *
 * @return richtext as a json serialized string.
 *
 * @example
 * ```graphql
 * type Article@storyblok {
 *   content: String@storyblokField(format: "richtext")
 * }
 * ```
 * ```ts
 * const resolvers = {
 *   Article: {
 *     content: (parent) => JSON.stringify(parent.content)
 *   },
 * }
 * ```
 */
export const richtextResolvers = (
  definitions: ObjectTypeDefinitionNode[],
  urlResolver: UrlResolver = (input: string) => input
) =>
  Object.fromEntries(
    definitions
      .filter(hasRichtextFields)
      .map((node) => [
        node.name.value,
        Object.fromEntries(
          node.fields
            ?.filter(isRichtextField)
            ?.map((field) => [
              field.name.value,
              richtextResolver(field.name.value, urlResolver),
            ]) ?? []
        ),
      ])
  )

const hasRichtextFields = (node: ObjectTypeDefinitionNode) =>
  node.fields?.some(isRichtextField)

const isRichtextField = (field: FieldDefinitionNode) =>
  !isArray(field.type) &&
  typeName(field.type) === 'String' &&
  findStoryblokFieldValue<EnumValueNode>(field, 'format')?.value === 'richtext'

export const richtextResolver =
  (prop: string, urlResolver: UrlResolver = (url: string) => url) =>
  (parent: any, _args?: any, context?: LinksContext) =>
    JSON.stringify(resolveUrls(parent[prop], urlResolver, context))

/**
 * Replaces all hrefs in a richtext json object with link objects in the context.
 */
const resolveUrls = (
  jsonData: object[],
  urlResolver: UrlResolver,
  context?: LinksContext
) =>
  recursivelyModifyObjects(jsonData, (value) => {
    if (value.type !== 'link') {
      return value
    }

    const fullSlug = context?.links?.find(
      (l) => l.uuid === value.attrs.uuid
    )?.full_slug

    if (!fullSlug) {
      return value
    }

    return {
      ...value,
      attrs: {
        ...value.attrs,
        href: urlResolver(fullSlug, context),
      },
    }
  })
