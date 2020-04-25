import { FieldNode, GraphQLResolveInfo } from 'graphql'
import { RelationMetadataArgs } from 'typeorm/metadata-args/RelationMetadataArgs'

export function getSelectedRelations(info: GraphQLResolveInfo, relations: Array<RelationMetadataArgs>): Array<string> {
  const selectedMembers = info.fieldNodes[0].selectionSet
    .selections
    .filter(node => node.kind === 'Field') as Array<FieldNode>

  return selectedMembers
    .filter(member => !!member.selectionSet && relations.find(rel => rel.propertyName === member.name.value))
    .map(member => member.name.value)
}
