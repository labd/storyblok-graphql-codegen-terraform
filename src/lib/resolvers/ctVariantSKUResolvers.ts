import {
  EnumValueNode,
  FieldDefinitionNode,
  ObjectTypeDefinitionNode,
} from 'graphql'
import { findStoryblokFieldValue, isArray, typeName } from '../graphql'

/**
 * Returns resolves for resolving Commercetools type ids.
 *
 * @example
 * ```graphql
 * type Article@storyblok {
 *   variantSKU: String@storyblokField(ctType: variant)
 *   variantSKUs: String@storyblokField(ctType: variant)
 * }
 * ```
 * ```ts
 * // result looks something like this:
 * const resolvers = {
 *   Article: {
 *     variantSKU: (parent) => parent.variantSKU?.key,
 *     variantSKUs: (parent) => parent.variantSKUs?.map(p => p?.key),
 *   },
 * }
 * ```
 */
export const ctVariantSKUResolvers = (
  definitions: ObjectTypeDefinitionNode[]
) =>
  Object.fromEntries(
    definitions
      .filter(hasCtVariantSKUFields)
      .map((node) => [
        node.name.value,
        Object.fromEntries(
          node.fields
            ?.filter(isCtVariantSKUField)
            ?.map((field) => [
              field.name.value,
              isArray(field.type)
                ? ctVariantSKUsResolver(field.name.value)
                : ctVariantSKUResolver(field.name.value),
            ]) ?? []
        ),
      ])
  )

type StoryblokPluginData = {
  _uid: string
  items: [
    {
      id: string
      sku?: string
      name: string
      type: 'category' | 'product'
      childCount?: number
      description: string
    }
  ]
  plugin: 'sb-commercetools'
}

const hasCtVariantSKUFields = (node: ObjectTypeDefinitionNode) =>
  node.fields?.some(isCtVariantSKUField)

const isCtVariantSKUField = (field: FieldDefinitionNode) =>
  typeName(field.type) === 'String' &&
  findStoryblokFieldValue<EnumValueNode>(field, 'ctType')?.value === 'variant'

const ctVariantSKUResolver = (prop: string) => (parent: any) => {
  const data = parent[prop] as StoryblokPluginData
  return data.items[0].sku
}

const ctVariantSKUsResolver = (prop: string) => (parent: any) => {
  const data = parent[prop] as StoryblokPluginData
  return data.items.map((item) => item.sku)
}
