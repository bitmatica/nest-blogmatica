import { Type } from '@nestjs/common'
import { FieldNode, GraphQLResolveInfo } from 'graphql'
import { EntityMetadata, getConnection, SelectQueryBuilder } from 'typeorm'

function addNestedRelations<TModel>(queryBuilder: SelectQueryBuilder<TModel>, entityMetadata: EntityMetadata, parentAlias: string, selections: Array<FieldNode>): SelectQueryBuilder<TModel> {
  return selections.reduce((prevBuilder: SelectQueryBuilder<TModel>, field: FieldNode) => {
    const selections = field.selectionSet?.selections.filter(selection => selection.kind === 'Field') as Array<FieldNode> | undefined
    if (!selections) {
      return prevBuilder
    }

    const relation = entityMetadata.relations.find(rel => rel.propertyName === field.name.value)
    if (!relation) {
      return prevBuilder
    }

    const relationPath = `${parentAlias}.${relation.propertyName}`
    const relationAlias = `${parentAlias}_${relation.propertyName}`

    return addNestedRelations(prevBuilder.leftJoinAndSelect(relationPath, relationAlias), relation.inverseEntityMetadata, relationAlias, selections)
  }, queryBuilder)
}

export function constructQueryWithRelations<TModel>(rootClass: Type<TModel>, info: GraphQLResolveInfo): SelectQueryBuilder<TModel> {
  const conn = getConnection()

  const rootAlias = rootClass.name.toLocaleLowerCase()

  const rootSelections: Array<FieldNode> = info.fieldNodes[0].selectionSet?.selections.filter(selection => selection.kind === 'Field') as Array<FieldNode>

  const rootMetadata = conn.entityMetadatas.find(metadata => metadata.target === rootClass)
  if (!rootMetadata) {
    throw new Error(`No entity metadata found for ${rootClass.name}, cannot construct relation with queries`)
  }
  const query = conn.createQueryBuilder()
    .select(rootAlias)
    .from(rootClass, rootAlias)

  return addNestedRelations(query, rootMetadata, rootAlias, rootSelections)
}
