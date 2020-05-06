import { SelectQueryBuilder } from 'typeorm'
import { RelationMetadata } from 'typeorm/metadata/RelationMetadata'
import { ComputedValue } from '../../computedValues'
import * as guards from './guards'
import { BooleanOperator, Comparator, ComparatorKey, ComparatorValue, QueryFilter } from './types'

type ParsedQuery = {
  query: string
  params: Record<string, any>
}

enum BooleanJoiner {
  And = 'AND',
  Or = 'OR',
}

type EntityReference = Function | string

export function mergeParsedQueries(
  queries: Array<ParsedQuery>,
  joiner: BooleanJoiner = BooleanJoiner.And,
): ParsedQuery {
  const mergedQuery = queries.reduce((prev, next) => {
    return {
      query: `${prev.query} ${joiner} ${next.query}`,
      params: {
        ...prev.params,
        ...next.params,
      },
    }
  })

  return {
    query: `( ${mergedQuery.query} )`,
    params: mergedQuery.params,
  }
}

export function parseBooleanOperator<T>(
  classType: EntityReference,
  queryBuilder: SelectQueryBuilder<any>,
  alias: string,
  operator: BooleanOperator<T>,
): ParsedQuery {
  if (guards.isAndOperator(operator)) {
    return mergeParsedQueries(
      operator.$and.map(query => {
        return parseQueryFilter(classType, queryBuilder, alias, query)
      }),
    )
  } else {
    return mergeParsedQueries(
      operator.$or.map(query => {
        return parseQueryFilter(classType, queryBuilder, alias, query)
      }),
      BooleanJoiner.Or,
    )
  }
}

export function eqComparator(
  alias: string,
  fieldName: string,
  comp: ComparatorValue<any>,
): ParsedQuery {
  const paramName = `${alias}_${fieldName}`
  return {
    query: `${alias}.${fieldName} = :${paramName}`,
    params: {
      [paramName]: comp,
    },
  }
}

export function likeComparator(
  alias: string,
  fieldName: string,
  comp: ComparatorValue<any>,
): ParsedQuery {
  const paramName = `${alias}_${fieldName}`
  return {
    query: `${alias}.${fieldName} LIKE :${paramName}`,
    params: {
      [paramName]: comp,
    },
  }
}

export function neqComparator(
  alias: string,
  fieldName: string,
  comp: ComparatorValue<any>,
): ParsedQuery {
  const paramName = `${alias}_${fieldName}`
  return {
    query: `${alias}.${fieldName} <> :${paramName}`,
    params: {
      [paramName]: comp,
    },
  }
}

export function gtComparator(
  alias: string,
  fieldName: string,
  comp: ComparatorValue<any>,
): ParsedQuery {
  const paramName = `${alias}_${fieldName}`
  return {
    query: `${alias}.${fieldName} > :${paramName}`,
    params: {
      [paramName]: comp,
    },
  }
}

export function gteComparator(
  alias: string,
  fieldName: string,
  comp: ComparatorValue<any>,
): ParsedQuery {
  const paramName = `${alias}_${fieldName}`
  return {
    query: `${alias}.${fieldName} >= :${paramName}`,
    params: {
      [paramName]: comp,
    },
  }
}

export function ltComparator(
  alias: string,
  fieldName: string,
  comp: ComparatorValue<any>,
): ParsedQuery {
  const paramName = `${alias}_${fieldName}`
  return {
    query: `${alias}.${fieldName} < :${paramName}`,
    params: {
      [paramName]: comp,
    },
  }
}

export function lteComparator(
  alias: string,
  fieldName: string,
  comp: ComparatorValue<any>,
): ParsedQuery {
  const paramName = `${alias}_${fieldName}`
  return {
    query: `${alias}.${fieldName} <= :${paramName}`,
    params: {
      [paramName]: comp,
    },
  }
}

export function inComparator(
  alias: string,
  fieldName: string,
  comp: ComparatorValue<any>,
): ParsedQuery {
  const paramName = `${alias}_${fieldName}`
  return {
    query: `${alias}.${fieldName} IN (:...${paramName})`,
    params: {
      [paramName]: comp,
    },
  }
}

export function containsComparator(
  alias: string,
  fieldName: string,
  comp: ComparatorValue<string>,
): ParsedQuery {
  const paramName = `${alias}_${fieldName}`
  const compWithWildcards =
    comp instanceof ComputedValue ? comp.map(prev => `%${prev}%`) : `%${comp}%`
  return {
    query: `${alias}.${fieldName} LIKE :${paramName}`,
    params: {
      [paramName]: compWithWildcards,
    },
  }
}

export function existsComparator(
  alias: string,
  fieldName: string,
  comp: ComparatorValue<any>,
): ParsedQuery {
  const paramName = `${alias}_${fieldName}`
  return {
    query: `(${alias}.${fieldName} IS NOT NULL) = ${paramName}`,
    params: {
      [paramName]: comp,
    },
  }
}

export type ComparatorParserFn = (
  alias: string,
  fieldName: string,
  comp: ComparatorValue<any>,
) => ParsedQuery

export const comparatorToParser: Record<ComparatorKey, ComparatorParserFn> = {
  [ComparatorKey.Equals]: eqComparator,
  [ComparatorKey.Like]: likeComparator,
  [ComparatorKey.NotEquals]: neqComparator,
  [ComparatorKey.Contains]: containsComparator,
  [ComparatorKey.GreaterThan]: gtComparator,
  [ComparatorKey.GreaterThanOrEquals]: gteComparator,
  [ComparatorKey.LessThan]: ltComparator,
  [ComparatorKey.LessThanOrEquals]: lteComparator,
  [ComparatorKey.In]: inComparator,
  [ComparatorKey.Exists]: existsComparator,
}

export function parseComparators(
  alias: string,
  fieldName: string,
  comparators: Comparator<any>,
): ParsedQuery {
  return mergeParsedQueries(
    Object.keys(comparators).map(comp => {
      const value = comparators[comp]
      const comparatorFunction = comparatorToParser[comp as ComparatorKey]
      if (comparatorFunction) {
        return comparatorFunction(alias, fieldName, value)
      }

      return eqComparator(alias, fieldName, value)
    }),
  )
}

export function handleManyToOneRelation<T>(
  queryBuilder: SelectQueryBuilder<T>,
  alias: string,
  relationName: string,
  relation: RelationMetadata,
  value: QueryFilter<T>,
): ParsedQuery {
  const joinAlias = `${alias}_${relationName}`
  const result = parseQueryFilter(relation.type, queryBuilder, joinAlias, value)

  const joinCondition = relation.joinColumns
    .map(joinColumn => {
      const referenceColumn = joinColumn.referencedColumn?.propertyName || ''
      return `${alias}.${relation.propertyName} = ${joinAlias}.${referenceColumn}`
    })
    .join(' AND ')

  const query = queryBuilder
    .subQuery()
    .select('true')
    .from(relation.type, joinAlias)
    .where(joinCondition)
    .andWhere(result.query)
    .getQuery()

  return {
    query,
    params: result.params,
  }
}

export function handleOneToManyRelation<T>(
  queryBuilder: SelectQueryBuilder<T>,
  alias: string,
  relationName: string,
  relation: RelationMetadata,
  filter: QueryFilter<T>,
): ParsedQuery {
  const joinAlias = `${alias}_${relationName}`
  const result = parseQueryFilter(relation.type, queryBuilder, joinAlias, filter)

  const joinColumns = relation.inverseRelation?.joinColumns || []
  const joinCondition = joinColumns
    .map(joinCol => {
      const referenceColumn = joinCol.referencedColumn?.propertyName || ''
      return `${alias}.${referenceColumn} = ${joinAlias}.${joinCol.propertyName}`
    })
    .join(' AND ')

  const query = queryBuilder
    .subQuery()
    .select(`${result.query} as result`)
    .from(relation.type, joinAlias)
    .where(joinCondition)
    .getQuery()

  return {
    query: `true = ALL(${query})`,
    params: result.params,
  }
}

export function parseQueryFilter<T>(
  classType: EntityReference,
  queryBuilder: SelectQueryBuilder<T>,
  alias: string,
  filter: QueryFilter<T>,
): ParsedQuery {
  return mergeParsedQueries(
    Object.keys(filter).map(fieldName => {
      const value = filter[fieldName as keyof QueryFilter<T>]
      if (guards.isComparator(value)) {
        return parseComparators(alias, fieldName, value)
      }
      if (guards.isComparatorValue(value)) {
        return eqComparator(alias, fieldName, value)
      }

      // Relationship Handling
      const entityMetadata = queryBuilder.connection.entityMetadatas.find(
        em => em.target === classType,
      )
      if (!entityMetadata) {
        throw `${classType} is not a TypeORM entity`
      }

      const relation = entityMetadata.relations.find(rel => rel.propertyName === fieldName)
      if (!relation) {
        console.log(`${fieldName} not a relation on ${classType}. Probably an error.`)
        return parseQueryFilter(classType, queryBuilder, `${alias}_${fieldName}`, value)
      }

      if (relation.relationType === 'many-to-one') {
        return handleManyToOneRelation(queryBuilder, alias, fieldName, relation, value)
      }

      if (relation.relationType === 'one-to-many') {
        return handleOneToManyRelation(queryBuilder, alias, fieldName, relation, value)
      }

      throw new Error(`Relation Type NYI: ${relation.relationType}`)
    }),
  )
}

export function parseScope<T>(
  className: EntityReference,
  queryBuilder: SelectQueryBuilder<T>,
  alias: string,
  filter: BooleanOperator<T> | QueryFilter<T>,
): ParsedQuery {
  if (guards.isBooleanOperator(filter)) {
    return parseBooleanOperator(className, queryBuilder, alias, filter)
  }
  return parseQueryFilter(className, queryBuilder, alias, filter)
}
