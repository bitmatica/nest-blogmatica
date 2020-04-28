import { ForbiddenException, Type } from '@nestjs/common'
import { FieldNode, GraphQLResolveInfo, SelectionSetNode } from 'graphql'
import { EntityMetadata, getConnection, SelectQueryBuilder } from 'typeorm'
import { ActionScope, Can, IUser, RecordScope } from '../../can'

function getFieldNodes(selectionSet: SelectionSetNode | undefined): Array<FieldNode> | undefined {
  return selectionSet?.selections.filter(selection => selection.kind === 'Field') as Array<FieldNode> | undefined
}

function addNestedRelations<TModel>(queryBuilder: SelectQueryBuilder<TModel>, entityMetadata: EntityMetadata, parentAlias: string, selections: Array<FieldNode>, user: IUser): SelectQueryBuilder<TModel> {
  return selections.reduce((prevBuilder: SelectQueryBuilder<TModel>, field: FieldNode) => {
    const selections = getFieldNodes(field.selectionSet)
    if (!selections) {
      return prevBuilder
    }

    const relation = entityMetadata.relations.find(rel => rel.propertyName === field.name.value)
    if (!relation) {
      return prevBuilder
    }

    const relationPath = `${parentAlias}.${relation.propertyName}`
    const relationAlias = `${parentAlias}_${relation.propertyName}`

    let condition = 'true = true'
    const recordScope = Can.check(user, ActionScope.Read, relation.inverseEntityMetadata.target as Type<any>)
    if (recordScope === RecordScope.None) condition = 'true = false'

    if (recordScope === RecordScope.Owned) {
      const ownershipField = Can.ownedBy(relation.inverseEntityMetadata.target as Type<any>)
      condition = `${relationAlias}.${ownershipField} = :userId`
    }

    return addNestedRelations(prevBuilder.leftJoinAndSelect(relationPath, relationAlias, condition, { userId: user.id }), relation.inverseEntityMetadata, relationAlias, selections, user)
  }, queryBuilder)
}

export function constructQueryWithRelations<TModel>(rootClass: Type<TModel>, info: GraphQLResolveInfo, user: IUser): SelectQueryBuilder<TModel> {
  const conn = getConnection()

  const rootAlias = rootClass.name.toLocaleLowerCase()

  const rootSelections = getFieldNodes(info.fieldNodes[0].selectionSet)
  if (!rootSelections) {
    throw new Error("No selection set found in query")
  }

  const rootMetadata = conn.entityMetadatas.find(metadata => metadata.target === rootClass)
  if (!rootMetadata) {
    throw new Error(`No entity metadata found for ${rootClass.name}, cannot construct relation with queries`)
  }
  const query = conn.createQueryBuilder()
    .select(rootAlias)
    .from(rootClass, rootAlias)

  return addNestedRelations(query, rootMetadata, rootAlias, rootSelections, user)
}
