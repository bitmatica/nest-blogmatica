import { types } from 'util'
import { BaseModel } from '../../../model'
import {
  ArrayOperator,
  BooleanOperator,
  Comparator,
  ComparatorValue,
  ComputedValue,
  ContainsComparator,
  ExistsComparator,
  GreaterThanComparator,
  GreaterThanOrEqualsComparator,
  LessThanComparator,
  LessThanOrEqualsComparator,
} from './types'
import isDate from 'lodash/isDate'

export function isBooleanOperator<T>(arg: any): arg is BooleanOperator<T> {
  return arg.hasOwnProperty('$and') || arg.hasOwnProperty('$or')
}

export function isEqualityComparator<T>(arg: any): arg is BooleanOperator<T> {
  return arg.hasOwnProperty('$eq')
}

export function isInComparator<T>(arg: any): arg is BooleanOperator<T> {
  return arg.hasOwnProperty('$in')
}

export function isContainsComparator<T>(arg: any): arg is ContainsComparator<T> {
  return arg.hasOwnProperty('$contains')
}

export function isExistsComparator<T>(arg: any): arg is ExistsComparator<T> {
  return arg.hasOwnProperty('$exists')
}

export function isLessThanComparator<T>(arg: any): arg is LessThanComparator<T> {
  return arg.hasOwnProperty('$lt')
}

export function isLessThanOrEqualsComparator<T>(arg: any): arg is LessThanOrEqualsComparator<T> {
  return arg.hasOwnProperty('$lte')
}

export function isGreaterThanComparator<T>(arg: any): arg is GreaterThanComparator<T> {
  return arg.hasOwnProperty('$gt')
}

export function isGreaterThanOrEqualsComparator<T>(arg: any): arg is GreaterThanOrEqualsComparator<T> {
  return arg.hasOwnProperty('$gte')
}

export function isComparator<T>(arg: any): arg is Comparator<T> {
  return isEqualityComparator(arg) ||
    isInComparator(arg) ||
    isContainsComparator(arg) ||
    isExistsComparator(arg) ||
    isLessThanComparator(arg) ||
    isLessThanOrEqualsComparator(arg) ||
    isGreaterThanComparator(arg) ||
    isGreaterThanOrEqualsComparator(arg)
}

export function isArrayOperator<T>(arg: any): arg is ArrayOperator<T> {
  return arg.hasOwnProperty('$any') || arg.hasOwnProperty('$all')
}

export function isModel<T>(arg: any): arg is BaseModel {
  return arg instanceof BaseModel
}

export function isComputedValue<T>(arg: any): arg is ComputedValue<T> {
  return arg instanceof ComputedValue
}

export function isComparatorValue<T>(arg: any): arg is ComparatorValue<T> {
  return isComputedValue(arg) || typeof arg === ('string' || 'number' || 'boolean') || isDate(arg)
}
