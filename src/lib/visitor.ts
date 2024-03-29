import { paramCase, snakeCase } from 'change-case'
import {
  GraphQLSchema,
  ObjectTypeDefinitionNode,
  StringValueNode,
} from 'graphql'
import { Resource, TerraformGenerator } from 'terraform-generator'
import { findStoryblokValue, hasDirective } from './graphql'
import { CtConfig, toComponent } from './mapper'

/**
 * This visitor checks the GraphQL object type and *updates* the terraform generator to include:
 * - a storyblok_content_type_schema resource
 * - a storyblok_content_type resource
 * - a storyblok_content_type_assignment resource (if a matching content repository is provided)
 */
export const createObjectTypeVisitor =
  (
    schema: GraphQLSchema,
    {
      tfg,
      spaceId,
      componentGroups,
      ctConfig,
    }: {
      tfg: TerraformGenerator
      spaceId: number
      componentGroups: Resource[]
      ctConfig?: CtConfig
    }
  ) =>
  (node: ObjectTypeDefinitionNode) => {
    if (
      node.name.value.startsWith('Storyblok') ||
      !hasDirective(node, 'storyblok')
    )
      return null

    const componentGroupName = findStoryblokValue<StringValueNode>(
      node,
      'componentGroup'
    )?.value

    let componentGroup = componentGroupName
      ? componentGroups.find(
          (componentGroup) =>
            componentGroup.name === snakeCase(componentGroupName)
        )
      : undefined

    if (componentGroupName && !componentGroup) {
      componentGroup = tfg.resource(
        'storyblok_component_group',
        snakeCase(componentGroupName),
        {
          name: paramCase(componentGroupName),
          space_id: spaceId,
        }
      )
      componentGroups.push(componentGroup)
    }

    tfg.resource(
      'storyblok_component',
      snakeCase(node.name.value),
      toComponent(node, spaceId, componentGroup, schema, ctConfig)
    )

    return null
  }
