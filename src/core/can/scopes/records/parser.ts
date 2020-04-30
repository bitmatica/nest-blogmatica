import { isBooleanOperator } from './guards'
import { ArrayOperator, BooleanOperator, ComparatorValue, DynamicComparator, QueryFilter } from './types'

export function parseBooleanOperator<T>(operator: BooleanOperator<T>) {
  console.log('Parsing Boolean Operator', operator)
}

export function parseQueryFilterItem<T>(item: QueryFilter<T> | ArrayOperator<any> | DynamicComparator<any> | ComparatorValue<any>) {

}

export function parseQueryFilter<T>(filter: QueryFilter<T>) {
  console.log('Parsing QueryFilter', filter)
  Object.keys(filter).map(key => {
    const value = filter[key as keyof QueryFilter<T>]
    console.log(value)
  })
}

export function parseScope<T>(filter: BooleanOperator<T> | QueryFilter<T>) {
  if (isBooleanOperator(filter)) {
    parseBooleanOperator(filter)
    return
  }
  parseQueryFilter(filter)
}
