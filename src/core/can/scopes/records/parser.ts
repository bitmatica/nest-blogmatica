import * as guards from './guards'
import { ArrayOperator, BooleanOperator, Comparator, ComparatorValue, QueryFilter } from './types'

export function parseBooleanOperator<T>(operator: BooleanOperator<T>) {
  console.log('Parsing Boolean Operator', operator)
  if (guards.isAndOperator(operator)) {
    operator.$and.map(parseQueryFilter)
  } else {
    operator.$or.map(parseQueryFilter)
  }
}

export function parseComparator(comp: Comparator<any>) {
  console.log('Parsing Comparator', comp)
}

export function parseComparatorValue(value: ComparatorValue<any>) {
  console.log('Parsing ComparatorValue', value)
}

export function parseArrayOperator(op: ArrayOperator<any>) {
  console.log('Parsing ArrayOperator', op)
  if (guards.isAllOperator(op)) {
    op.$all.map(parseQueryFilter)
  } else {
    op.$any.map(parseQueryFilter)
  }
}

export function parseQueryFilter<T>(filter: QueryFilter<T>) {
  console.log('Parsing QueryFilter', filter)
  Object.keys(filter).map(key => {
    const item = filter[key as keyof QueryFilter<T>]

    if (guards.isComparator(item)) {
      return parseComparator(item)
    }
    if (guards.isComparatorValue(item)) {
      return parseComparatorValue(item)
    }
    if (guards.isArrayOperator(item)) {
      return parseArrayOperator(item)
    }

    parseQueryFilter(item as QueryFilter<any>)
  })
}

export function parseScope<T>(filter: BooleanOperator<T> | QueryFilter<T>) {
  if (guards.isBooleanOperator(filter)) {
    parseBooleanOperator(filter)
    return
  }
  parseQueryFilter(filter)
}
