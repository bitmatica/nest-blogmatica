import { BaseModel } from '../../../model'
import { ComputedValue } from '../../computedValues'

export type ComparatorValue<T> = T | ComputedValue<T>

export enum ComparatorKey {
  Equals = '$eq',
  NotEquals = '$neq',
  In = '$in',
  Contains = '$contains',
  Exists = '$exists',
  LessThan = '$lt',
  LessThanOrEquals = '$lte',
  GreaterThan = '$gt',
  GreaterThanOrEquals = '$gte',
}

export type EqualsComparator<T> = {
  $eq: ComparatorValue<T>
}

export type NotEqualsComparator<T> = {
  $neq: ComparatorValue<T>
}

export type InComparator<T> = {
  $in: [ComparatorValue<T>]
}

export type ContainsComparator<T> = {
  $contains: ComparatorValue<T>
}

export type ExistsComparator<T> = {
  $exists: boolean
}

export type LessThanComparator<T> = {
  $lt: ComparatorValue<T>
}

export type LessThanOrEqualsComparator<T> = {
  $lte: ComparatorValue<T>
}

export type GreaterThanComparator<T> = {
  $gt: ComparatorValue<T>
}

export type GreaterThanOrEqualsComparator<T> = {
  $gte: ComparatorValue<T>
}

export type GenericComparator<T> =
  | T
  | EqualsComparator<T>
  | InComparator<T>
  | NotEqualsComparator<T>
export type ArrayComparator<T> = ContainsComparator<T>
export type StringComparator<T> = GenericComparator<T> | ContainsComparator<T>
export type NumberComparator<T> =
  | GenericComparator<T>
  | LessThanComparator<T>
  | LessThanOrEqualsComparator<T>
  | GreaterThanComparator<T>
  | GreaterThanOrEqualsComparator<T>
export type BooleanComparator<T> = GenericComparator<T>

export type Comparator<T> =
  | ArrayComparator<T>
  | StringComparator<T>
  | BooleanComparator<T>
  | NumberComparator<T>
  | ExistsComparator<T>

export type Maybe<T> = T | undefined

export type DynamicComparator<T> = T extends number | Date
  ? NumberComparator<T>
  : T extends string
  ? StringComparator<T>
  : T extends boolean
  ? BooleanComparator<T>
  : T extends Maybe<infer U>
  ? U extends Maybe<infer V> // Have to nest here because all query fields are optional, so doing 2nd unpack is actual column
    ? ExistsComparator<U>
    : Comparator<U>
  : Comparator<T>

export type OrOperator<T> = {
  $or: Array<QueryFilter<T>>
}

export type AndOperator<T> = {
  $and: Array<QueryFilter<T>>
}

export type BooleanOperator<T> = OrOperator<T> | AndOperator<T>

export type QueryFilter<T> = {
  [P in keyof T]?: T[P] extends BaseModel
    ? QueryFilter<T[P]>
    : T[P] extends PromiseLike<infer U>
    ? U extends Array<infer V>
      ? V extends BaseModel
        ? QueryFilter<V>
        : DynamicComparator<V>
      : DynamicComparator<U> | QueryFilter<U>
    : T[P] extends Array<infer U>
    ? U extends BaseModel
      ? QueryFilter<U>
      : DynamicComparator<U> | QueryFilter<U>
    : DynamicComparator<T[P]> | ComparatorValue<T[P]>
}
