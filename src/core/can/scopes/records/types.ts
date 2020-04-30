import { BaseModel } from '../../../model'

export abstract class ComputedValue<T> {
  abstract value(context: any): T
  abstract get<U extends keyof T>(key: U): ComputedValue<T[U]>
}

export type ComparatorValue<T> = T | ComputedValue<T>

export type EqualityComparator<T> = {
  $eq: ComparatorValue<T>
}

export type InComparator<T> = {
  $in: [ ComparatorValue<T> ]
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

export type GenericComparator<T> = T | EqualityComparator<T> | InComparator<T>
export type ArrayComparator<T> = ContainsComparator<T>
export type StringComparator<T> = GenericComparator<T> | ContainsComparator<T>
export type NumberComparator<T> =
  GenericComparator<T>
  | LessThanComparator<T>
  | LessThanOrEqualsComparator<T>
  | GreaterThanComparator<T>
  | GreaterThanOrEqualsComparator<T>
export type BooleanComparator<T> = GenericComparator<T>

export type Comparator<T> =
  ArrayComparator<T>
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
        ? U extends Maybe<infer V> // Have to nest here because all of the query fields are technically Optional, so doing 2 layers gets at whether or not the actual column export type is nullable
          ? ExistsComparator<V>
          : Comparator<T>
        : Comparator<T>

export type BooleanOperator<T> = {
  $or?: Array<QueryFilter<T>>
  $and?: Array<QueryFilter<T>>
}

export type ThenArg<T> = T extends PromiseLike<infer U> ? U : T

export type ArrayArg<T> = T extends Array<infer U> ? U : T

export type UnpackedArg<T> = ArrayArg<ThenArg<T>>

export type ArrayOperator<T> = {
  $any?: Array<QueryFilter<T>>
  $all?: Array<QueryFilter<T>>
}

export type QueryFilter<T> = {
  [P in keyof T]?: T[P] extends BaseModel
    ? QueryFilter<T[P]>
    : T[P] extends PromiseLike<infer U>
      ? U extends Array<infer V>
        ? V extends BaseModel
          ? ArrayOperator<V>
          : DynamicComparator<V>
        : DynamicComparator<U> | QueryFilter<U>
      : T[P] extends Array<infer U>
        ? U extends BaseModel
          ? ArrayOperator<U>
          : DynamicComparator<U> | QueryFilter<U>
        : DynamicComparator<UnpackedArg<T[P]>> | ComparatorValue<T[P]>
}
