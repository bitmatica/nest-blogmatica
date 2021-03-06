import { Type } from '@nestjs/common'
import { FieldNode, GraphQLResolveInfo, SelectionSetNode } from 'graphql'
import { EntityMetadata, getConnection, SelectQueryBuilder } from 'typeorm'
import { ActionScope, Can } from '../../can'
import { IContext } from '../../context'

function getFieldNodes(selectionSet: SelectionSetNode | undefined): Array<FieldNode> | undefined {
  return selectionSet?.selections.filter(selection => selection.kind === 'Field') as
    | Array<FieldNode>
    | undefined
}

function addNestedRelations<TModel>(
  queryBuilder: SelectQueryBuilder<TModel>,
  entityMetadata: EntityMetadata,
  parentAlias: string,
  selections: Array<FieldNode>,
  context: IContext,
): SelectQueryBuilder<TModel> {
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

    const recordScope = Can.check(
      context,
      ActionScope.Read,
      relation.inverseEntityMetadata.target as Type<any>,
    )
    const joinCondition = recordScope.where(relationAlias, context)(prevBuilder)

    const nextBuilder = prevBuilder.leftJoinAndSelect(
      relationPath,
      relationAlias,
      joinCondition.query,
      joinCondition.parameters,
    )
    return addNestedRelations(
      nextBuilder,
      relation.inverseEntityMetadata,
      relationAlias,
      selections,
      context,
    )
  }, queryBuilder)
}

export function constructQueryWithRelations<TModel>(
  rootClass: Type<TModel>,
  info: GraphQLResolveInfo,
  context: IContext,
): SelectQueryBuilder<TModel> {
  const conn = getConnection()

  const rootAlias = rootClass.name.toLocaleLowerCase()

  const rootSelections = getFieldNodes(info.fieldNodes[0].selectionSet)
  if (!rootSelections) {
    throw new Error('No selection set found in query')
  }

  const rootMetadata = conn.entityMetadatas.find(metadata => metadata.target === rootClass)
  if (!rootMetadata) {
    throw new Error(
      `No entity metadata found for ${rootClass.name}, cannot construct relation with queries`,
    )
  }

  const recordScope = Can.check(context, ActionScope.Read, rootClass)
  const query = conn
    .createQueryBuilder()
    .select(rootAlias)
    .from(rootClass, rootAlias)

  const scopeQuery = recordScope.where(rootAlias, context)(query)

  return addNestedRelations(
    query.where(scopeQuery.query, scopeQuery.parameters),
    rootMetadata,
    rootAlias,
    rootSelections,
    context,
  )
}
