import {
  DefinitionNode,
  EnumTypeDefinitionNode,
  FieldDefinitionNode,
  Kind,
  ObjectTypeDefinitionNode,
  StringValueNode,
} from 'graphql'
import {
  findStoryblokFieldValue,
  isObjectTypeDefinitionNode,
  typeName,
} from '../graphql'

/**
 * Returns resolves for resolving Commercetools type ids.
 *
 * @example
 * ```graphql
 * enum ArticleIcon {
 *   NEWS, BLOG, EVENT
 * }
 *
 * type Article@storyblok {
 *   icon: ArticleIcon@storyblokField(default: "NEWS")
 *   iconNoDefault: ArticleIcon@storyblokField
 * }
 * ```
 * ```ts
 * // result looks something like this:
 * const resolvers = {
 *   Article: {
 *     icon: (parent) => parent.icon || 'NEWS',
 *     iconNoDefault: (parent) => parent.icon || undefined,
 *   },
 * }
 * ```
 */
export const enumResolvers = (definitions: readonly DefinitionNode[]) => {
  const enumNames = getEnums(definitions).map((u) => u.name.value)

  return Object.fromEntries(
    definitions
      .filter(isObjectTypeDefinitionNode)
      .filter(hasEnumFields(enumNames))
      .map((node) => [
        node.name.value,
        Object.fromEntries(
          node.fields
            ?.filter(isEnumField(enumNames))
            ?.map((field) => [
              field.name.value,
              enumResolver(
                field.name.value,
                findStoryblokFieldValue<StringValueNode>(field, 'default')
                  ?.value
              ),
            ]) ?? []
        ),
      ])
  )
}

const getEnums = (definitions: readonly DefinitionNode[]) =>
  definitions.filter(
    (d): d is EnumTypeDefinitionNode => d.kind === Kind.ENUM_TYPE_DEFINITION
  )

const hasEnumFields =
  (enumNames: string[]) => (node: ObjectTypeDefinitionNode) =>
    node.fields?.some(isEnumField(enumNames))

const isEnumField = (enumNames: string[]) => (field: FieldDefinitionNode) =>
  enumNames.includes(typeName(field.type))

// transform empty strings to fallback or undefined
const enumResolver = (prop: string, fallback?: string) => (parent: any) =>
  parent[prop] || fallback
