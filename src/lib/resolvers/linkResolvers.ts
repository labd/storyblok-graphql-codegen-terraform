import { FieldDefinitionNode, ObjectTypeDefinitionNode } from 'graphql'
import { isArray, typeName } from '../graphql'

export type UrlResolver = (input: string, context?: object) => string

/**
 * Returns resolves for resolving StoryblokLink fields.
 *
 * For internal links, we will look in the context for the `links` array which should be set after the storyblok api call.
 * To get links, do a request with the `resolve_links=url` parameter.
 *
 *
 * @example
 * ```graphql
 * type Article@storyblok {
 *   link: StoryblokLink@storyblokField
 * }
 * ```
 * ```ts
 * // result looks something like this:
 * const resolvers = {
 *   Article: {
 *     link: (parent) => ({
 *       url: ...
 *       pathname: ...
 *       hash: ...
 *       newTab: ...
 *       type: ...
 *     })
 *   },
 * }
 * ```
 */
export const linkResolvers = (
  definitions: ObjectTypeDefinitionNode[],
  urlResolver: UrlResolver = (input: string) => input
) =>
  Object.fromEntries(
    definitions
      .filter(hasLinkFields)
      .map((node) => [
        node.name.value,
        Object.fromEntries(
          node.fields
            ?.filter(isLinkField)
            ?.map((field) => [
              field.name.value,
              linkResolver(field.name.value, urlResolver),
            ]) ?? []
        ),
      ])
  )

type ApiLink = {
  id?: string
  linktype: 'story' | 'url' | 'email' | 'asset'
  fieldtype?: 'multilink'
  url: string
  cached_url?: string
  target?: '_self' | '_blank'
  anchor?: string
}

const hasLinkFields = (node: ObjectTypeDefinitionNode) =>
  node.fields?.some(isLinkField)

const isLinkField = (field: FieldDefinitionNode) =>
  !isArray(field.type) && typeName(field.type) === 'StoryblokLink'

type StoryblokLink = {
  type: 'internal' | 'external' | 'email' | 'asset'
  url: string
  pathname: string
  hash?: string
  newTab: boolean
}

type Link = {
  uuid: string
  full_slug: string
}

export type LinksContext = { links?: Link[] }

const linkResolver =
  (prop: string, urlResolver: UrlResolver) =>
  (
    parent: any,
    _args?: any,
    context?: LinksContext
  ): StoryblokLink | undefined => {
    const link = parent[prop] as ApiLink
    if (!link) {
      return undefined
    }

    return toStoryblokLink(link, urlResolver, context)
  }

export const toStoryblokLink = (
  link: any,
  urlResolver: UrlResolver,
  context?: LinksContext
): StoryblokLink | undefined => {
  // internal story links
  if (link.linktype === 'story' && link.id) {
    // if a context is provided (through &resolve_links=url), we use it to resolve the link
    if (context?.links) {
      const fullSlug = context.links.find((l) => l.uuid === link.id)?.full_slug

      // if no link is found, it means it's unpublished, and we don't want to link to it
      if (!fullSlug) {
        return undefined
      }

      return {
        type: 'internal',
        hash: link.anchor,
        newTab: link.target === '_blank', // internal links are not newTab by default
        url:
          urlResolver(fullSlug, context) +
          (link.anchor ? `#${link.anchor}` : ''),
        pathname: urlResolver(fullSlug, context),
      }
    } else if (context && link.story?.full_slug) {
      const fullSlug = link.story.full_slug

      return {
        type: 'internal',
        hash: link.anchor,
        newTab: link.target === '_blank', // internal links are not newTab by default
        url:
          urlResolver(fullSlug, context) +
          (link.anchor ? `#${link.anchor}` : ''),
        pathname: urlResolver(fullSlug, context),
      }
    }

    // if there is no context, we do it through the cached_url
    // this is not recommended, as it's not always accurate
    return {
      type: 'internal',
      hash: link.anchor,
      newTab: link.target === '_blank', // internal links are not newTab by default
      url: link.cached_url?.startsWith('http')
        ? new URL(link.cached_url).pathname +
          (link.anchor ? `#${link.anchor}` : '')
        : link.cached_url ?? '',
      pathname: link.cached_url?.startsWith('http')
        ? new URL(link.cached_url).pathname
        : link.cached_url ?? '',
    }
  }

  // email links
  if (link.linktype === 'email') {
    return {
      type: 'email',
      newTab: true,
      url: `mailto:${link.url}`,
      pathname: `mailto:${link.url}`,
    }
  }

  // asset links
  if (link.linktype === 'asset' && link.id) {
    return {
      type: 'asset',
      newTab: true,
      url: link.url,
      pathname: link.url,
    }
  }

  // external absolute links
  if (link.url?.startsWith('http')) {
    return {
      type: 'external',
      url: link.url,
      pathname: new URL(link.url).pathname,
      hash: new URL(link.url).hash.substring(1), // remove the first '#'
      newTab: link.target !== '_self', // external links are newTab by default
    }
  }

  // internal relative links
  return {
    type: 'internal',
    url: link.url,
    pathname: new URL(link.url, 'http://dummy.com').pathname,
    hash: new URL(link.url, 'http://dummy.com').hash.substring(1), // remove the first '#'
    newTab: link.target === '_blank', // internal links are not newTab by default
  }
}
