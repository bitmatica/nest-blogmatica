import isDate from 'lodash/isDate'
import { BaseModel } from '../../../model'
import { ComputedValue } from '../../computedValues'
import {
  AndOperator,
  BooleanOperator,
  Comparator,
  ComparatorValue,
  ContainsComparator,
  EqualsComparator,
  ExistsComparator,
  GreaterThanComparator,
  GreaterThanOrEqualsComparator,
  InComparator,
  LessThanComparator,
  LessThanOrEqualsComparator,
  NotEqualsComparator,
  OrOperator,
} from './types'

export function isEqualsComparator<T>(arg: any): arg is EqualsComparator<T> {
  return arg.hasOwnProperty('$eq')
}

export function isNotEqualsComparator<T>(
  arg: any,
): arg is NotEqualsComparator<T> {
  return arg.hasOwnProperty('$neq')
}

export function isInComparator<T>(arg: any): arg is InComparator<T> {
  return arg.hasOwnProperty('$in')
}

export function isContainsComparator<T>(
  arg: any,
): arg is ContainsComparator<T> {
  return arg.hasOwnProperty('$contains')
}

export function isExistsComparator<T>(arg: any): arg is ExistsComparator<T> {
  return arg.hasOwnProperty('$exists')
}

export function isLessThanComparator<T>(
  arg: any,
): arg is LessThanComparator<T> {
  return arg.hasOwnProperty('$lt')
}

export function isLessThanOrEqualsComparator<T>(
  arg: any,
): arg is LessThanOrEqualsComparator<T> {
  return arg.hasOwnProperty('$lte')
}

export function isGreaterThanComparator<T>(
  arg: any,
): arg is GreaterThanComparator<T> {
  return arg.hasOwnProperty('$gt')
}

export function isGreaterThanOrEqualsComparator<T>(
  arg: any,
): arg is GreaterThanOrEqualsComparator<T> {
  return arg.hasOwnProperty('$gte')
}

export function isComparator<T>(arg: any): arg is Comparator<T> {
  return (
    isNotEqualsComparator(arg) ||
    isEqualsComparator(arg) ||
    isInComparator(arg) ||
    isContainsComparator(arg) ||
    isExistsComparator(arg) ||
    isLessThanComparator(arg) ||
    isLessThanOrEqualsComparator(arg) ||
    isGreaterThanComparator(arg) ||
    isGreaterThanOrEqualsComparator(arg)
  )
}

export function isOrOperator<T>(arg: any): arg is OrOperator<T> {
  return arg.hasOwnProperty('$or')
}

export function isAndOperator<T>(arg: any): arg is AndOperator<T> {
  return arg.hasOwnProperty('$and')
}

export function isBooleanOperator<T>(arg: any): arg is BooleanOperator<T> {
  return isOrOperator(arg) || isAndOperator(arg)
}

export function isModel<T>(arg: any): arg is BaseModel {
  return (
    arg.hasOwnProperty('id') &&
    arg.hasOwnProperty('createdAt') &&
    arg.hasOwnProperty('updatedAt')
  )
}

export function isComputedValue<T>(arg: any): arg is ComputedValue<T> {
  return arg instanceof ComputedValue
}

export function isComparatorValue<T>(arg: any): arg is ComparatorValue<T> {
  return (
    isComputedValue(arg) ||
    typeof arg === ('string' || 'number' || 'boolean') ||
    isDate(arg)
  )
}
