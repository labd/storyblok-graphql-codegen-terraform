import { Block, Resource, TerraformGenerator } from 'terraform-generator'

const isResource = (block: Block): block is Resource => {
  return block.blockType === 'resource'
}

const blockString = (block: Block): string => {
  if (isResource(block)) {
    return `${block.type}.${block.name}`
  }
  return block.blockType
}

const blockCompare = (a: Block, b: Block) => {
  return blockString(a).localeCompare(blockString(b))
}

export const tfWithSortedBlocks = (tfg: TerraformGenerator) => {
  const result = new TerraformGenerator()
  result.addBlocks(...tfg.getBlocks().sort(blockCompare))
  return result
}
