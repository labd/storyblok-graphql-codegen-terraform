import { mergeResolvers } from '@graphql-tools/merge'
import { DocumentNode } from 'graphql'
import { isObjectTypeDefinitionNode } from './lib/graphql'
import { assetResolvers } from './lib/resolvers/assetResolvers'
import { ctCategoryIdResolvers } from './lib/resolvers/ctCategoryIdResolvers'
import { ctCategoryKeyResolvers } from './lib/resolvers/ctCategoryKeyResolvers'
import { ctTypeIdResolvers } from './lib/resolvers/ctTypeIdResolvers'
import { enumResolvers } from './lib/resolvers/enumResolvers'
import { idResolvers } from './lib/resolvers/idResolvers'
import { linkResolvers } from './lib/resolvers/linkResolvers'
import { richtextResolvers } from './lib/resolvers/richtextResolvers'
import { seoResolvers } from './lib/resolvers/seoResolver'
import { singleBlokFieldResolvers } from './lib/resolvers/singleBlokResolvers'
import { storyOptionFieldResolvers } from './lib/resolvers/storyOptionResolvers'
import { tableResolvers } from './lib/resolvers/tableResolvers'
import {
  unionArrayFieldResolvers,
  unionResolvers,
} from './lib/resolvers/unionSchemaResolvers'

type Options = {
  slugResolver?: (fullSlug: string, context?: object) => string
  useCategoryKey?: boolean
}

export const storyblokResolvers = (
  documentNode: DocumentNode,
  { slugResolver, useCategoryKey }: Options = {
    slugResolver: (fullSlug: string) => fullSlug,
    useCategoryKey: false,
  }
): any => {
  const definitions = documentNode.definitions.filter(
    isObjectTypeDefinitionNode
  )
  return mergeResolvers([
    idResolvers(definitions),
    singleBlokFieldResolvers(definitions),
    unionArrayFieldResolvers(definitions),
    storyOptionFieldResolvers(definitions),
    unionResolvers(documentNode.definitions),
    richtextResolvers(definitions, slugResolver),
    linkResolvers(definitions, slugResolver),
    assetResolvers(definitions),
    seoResolvers(definitions),
    useCategoryKey
      ? ctCategoryKeyResolvers(definitions)
      : ctCategoryIdResolvers(definitions),
    ctTypeIdResolvers(definitions),
    tableResolvers(definitions),
    enumResolvers(documentNode.definitions),
  ])
}

export const updateContext =
  <C extends {}>(context: C) =>
  <T extends { data: any }>(responseData: T) => {
    Object.assign(context, {
      links: responseData.data.links,
      rels: responseData.data.rels,
    })
    return responseData
  }
