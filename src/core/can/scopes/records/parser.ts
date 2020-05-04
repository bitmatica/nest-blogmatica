import { Type } from '@nestjs/common/interfaces/type.interface'
import { SelectQueryBuilder } from 'typeorm'
import * as guards from './guards'
import {
  ArrayOperator,
  BooleanOperator,
  Comparator,
  ComparatorKey,
  ComparatorValue,
  QueryFilter,
} from './types'

type ParsedQuery = {
  query: string
  params: Record<string, any>
}

enum BooleanJoiner {
  And = 'AND',
  Or = 'OR',
}

export function mergeParsedQueries(
  queries: Array<ParsedQuery>,
  joiner: BooleanJoiner = BooleanJoiner.And,
): ParsedQuery {
  console.log('merging', queries)
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
  classType: Type<any>,
  alias: string,
  operator: BooleanOperator<T>,
): ParsedQuery {
  console.log('Parsing Boolean Operator', operator)
  if (guards.isAndOperator(operator)) {
    return mergeParsedQueries(
      operator.$and.map(query => {
        return parseQueryFilter(classType, alias, query)
      }),
    )
  } else {
    return mergeParsedQueries(
      operator.$or.map(query => {
        return parseQueryFilter(classType, alias, query)
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
  console.log('eq comparator', alias, fieldName, comp)
  const paramName = `${alias}_${fieldName}`
  return {
    query: `${alias}.${fieldName} = :${paramName}`,
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
  console.log('eq comparator', alias, fieldName, comp)
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
  console.log('eq comparator', alias, fieldName, comp)
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
  console.log('eq comparator', alias, fieldName, comp)
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
  console.log('eq comparator', alias, fieldName, comp)
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
  console.log('eq comparator', alias, fieldName, comp)
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
  console.log('eq comparator', alias, fieldName, comp)
  const paramName = `${alias}_${fieldName}`
  return {
    query: `${alias}.${fieldName} in :(...${paramName})`,
    params: {
      [paramName]: comp,
    },
  }
}

export function containsComparator(
  alias: string,
  fieldName: string,
  comp: ComparatorValue<any>,
): ParsedQuery {
  console.log('eq comparator', alias, fieldName, comp)
  const paramName = `${alias}_${fieldName}`
  return {
    query: `${alias}.${fieldName} contains :${paramName}`,
    params: {
      [paramName]: comp,
    },
  }
}

export function existsComparator(
  alias: string,
  fieldName: string,
  comp: ComparatorValue<any>,
): ParsedQuery {
  console.log('eq comparator', alias, fieldName, comp)
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
  console.log('Parsing Comparators')
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

export function parseArrayOperator(
  classType: Type<any>,
  alias: string,
  op: ArrayOperator<any>,
): ParsedQuery {
  console.log('Parsing ArrayOperator', op)
  if (guards.isAllOperator(op)) {
    const queries = mergeParsedQueries(
      op.$all.map(allOp => parseQueryFilter(classType, alias, allOp)),
    )
    return {
      query: `true = ALL(${queries.query})`,
      params: queries.params,
    }
  } else {
    const queries = mergeParsedQueries(
      op.$any.map(anyOp => parseQueryFilter(classType, alias, anyOp)),
    )
    return {
      query: `true = ANY(${queries.query})`,
      params: queries.params,
    }
  }
}

export function parseQueryFilter<T>(
  classType: Type<any>,
  alias: string,
  filter: QueryFilter<T>,
): ParsedQuery {
  console.log('Parsing QueryFilter', filter)

  return mergeParsedQueries(
    Object.keys(filter).map(fieldName => {
      const value = filter[fieldName as keyof QueryFilter<T>]
      if (guards.isArrayOperator(value)) {
        return parseArrayOperator(classType, alias, value)
      }
      if (guards.isComparator(value)) {
        return parseComparators(alias, fieldName, value)
      }
      if (guards.isComparatorValue(value)) {
        return eqComparator(alias, fieldName, value)
      }

      // Relationship Handling
      const newAlias = `${alias}_${fieldName}`
      console.log('Recursing', newAlias, value)
      return parseQueryFilter(classType, newAlias, value as QueryFilter<any>)
    }),
  )
}

export function parseScope<T>(
  className: Type<T>,
  queryBuilder: SelectQueryBuilder<T>,
  filter: BooleanOperator<T> | QueryFilter<T>,
): ParsedQuery {
  const rootAlias = className.name.toLocaleLowerCase()
  if (guards.isBooleanOperator(filter)) {
    return parseBooleanOperator(className, rootAlias, filter)
  }
  return parseQueryFilter(className, rootAlias, filter)
}
