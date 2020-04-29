// can edit comments where comment.authorId == userId OR comment.post.authorId == userId
/*
  user => {
    return {
      authorId: user.id
    }
  }

  user => {
    return {
      post: {
        authorId: user.id
      }
    }
  }
 */
//
// type CanAccessFunction<TModel, K extends keyof TModel> = (className: Type<TModel>, where: Record<K, string>) => string
//
// function canAccess<TModel, K extends keyof TModel, U, Y extends keyof U>(className: Type<TModel>, where: Record<Y, CanAccessFunction<U, any>> | Record<K, string>) {
//   return ''
// }


// type CanAccessFunction<TModel, K extends keyof TModel> = (className: Type<TModel>, where: Record<K, string>) => string

import { Type } from '@nestjs/common'
import { getFileInfo } from 'prettier'

type Role = {
  id: string
  name: string
}

type Organization = {
  id: string
}

type Profile = {
  id: string
  picture?: string
}

type User = {
  id: string
  roles: Array<Role>
  profile: Profile
  organizations: Array<Organization>
  mainOrganization: Organization
  inviter: User
}

type Post = {
  id: string
  author: User
  title: string
  createdAt: Date
}


function canAccess<TModel>(className: Type<TModel>, where: Record<keyof TModel, string>) {
  return ''
}

const f = function prop<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key]
}

// class Relation<T, U extends keyof T> {
//   constructor(private classType: Type<T>) {}
//
//   where<V extends T[U], W extends keyof V>(op: Operation<V, W>): string {
//     return op.compute()
//   }
// }


abstract class Operation<T> {

  abstract compute(context: UserContext, alias: string): string

}

class Relation<T, U extends keyof T> {

  public operations: Array<Operation<any>> = []

  constructor(classType: Type<T>, private query: Record<U, string> | undefined = undefined) {

  }

  where<V extends T[U], W extends keyof V>(key: U, op: Operation<V> | Relation<V, W>): Relation<T, U> {

    if (op instanceof Operation) {
      this.operations.push(op)
    } else if (op instanceof Relation) {
      this.operations.concat(op.operations)
    }

    return this
  }


}

class CanAccess<T, U extends keyof T> extends Relation<T, U> {

}


class UserContext {

}

abstract class Value<T> {
  abstract value(context: UserContext): T
}

class StaticValue<T> extends Value<T> {
  constructor(public v: T) {
    super()
  }

  value(context: UserContext): T {
    return this.v
  }
}

class CurrentUserId extends Value<string> {
  value(context: UserContext): string {
    return 'user id'
  }
}

class ComparisonOperation<T> extends Operation<T> {

  constructor(private value: Value<T>, private op: string) {
    super()
  }

  compute(context: UserContext, alias: string): string {
    return alias + ' ' + this.op + ' ' + this.value.value(context)
  }
}

class Equals<T> extends ComparisonOperation<T> {
  constructor(value: Value<T>) {
    super(value, '=')
  }
}

class GreaterThan<T> extends ComparisonOperation<T> {
  constructor(value: Value<T>) {
    super(value, '>')
  }
}

class GreaterThanOrEquals<T> extends ComparisonOperation<T> {
  constructor(value: Value<T>) {
    super(value, '>=')
  }
}

class LessThan<T> extends ComparisonOperation<T> {
  constructor(value: Value<T>) {
    super(value, '<')
  }
}

class LessThanOrEquals<T> extends ComparisonOperation<T> {
  constructor(value: Value<T>) {
    super(value, '<=')
  }
}

class BooleanOperation<T> extends Operation<T> {
  constructor(private one: Operation<T>, private two: Operation<T>, private op: string) {
    super()
  }

  compute(context: UserContext, alias: string): string {
    return this.one.compute(context, alias) + ' ' + this.op + ' ' + this.two.compute(context, alias)
  }
}

class And<T> extends BooleanOperation<T> {
  constructor(one: Operation<T>, two: Operation<T>) {
    super(one, two, 'AND')
  }
}

class Or<T> extends BooleanOperation<T> {
  constructor(one: Operation<T>, two: Operation<T>) {
    super(one, two, 'OR')
  }
}


// new CanAccess(Comment).where('authorId', new Equals(new StaticValue('asdf')))
//
// new CanAccess(Comment).where('authorId', new Equals(new CurrentUserId()))
//
// new CanAccess(Comment).where('post', new Relation(Post).where('authorId', new Equals(new StaticValue('asdf'))))

type ComputedValue<T> = {
  value(context: UserContext): T
}

type ComparatorValue<T> = T | ComputedValue<T>

type EqualityComparator<T> = {
  eq: ComparatorValue<T>
}

type InComparator<T> = {
  in: [ ComparatorValue<T> ]
}

type ContainsComparator<T> = {
  contains: ComparatorValue<T>
}

type ExistsComparator<T> = {
  exists: boolean
}

type LessThanComparator<T> = {
  lt: ComparatorValue<T>
}

type LessThanOrEqualsComparator<T> = {
  lte: ComparatorValue<T>
}

type GreaterThanComparator<T> = {
  gt: ComparatorValue<T>
}

type GreaterThanOrEqualsComparator<T> = {
  gte: ComparatorValue<T>
}


type GenericComparitor<T> = EqualityComparator<T> | InComparator<T>
type ArrayComparator<T> = ContainsComparator<T>
type StringComparator<T> = GenericComparitor<T> | ContainsComparator<T>
type NumberComparator<T> = GenericComparitor<T> | LessThanComparator<T> | LessThanOrEqualsComparator<T> | GreaterThanComparator<T> | GreaterThanOrEqualsComparator<T>
type BooleanComparator<T> = GenericComparitor<T>

type Comparator<T> = ArrayComparator<T> | StringComparator<T> | BooleanComparator<T> | NumberComparator<T> | ExistsComparator<T>

type Maybe<T> = T | undefined

type DynamicComparator<T> = T extends number | Date
  ? NumberComparator<T>
  : T extends string
    ? StringComparator<T>
    : T extends boolean
      ? BooleanComparator<T>
      : T extends Maybe<infer U>
        ? U extends Maybe<infer V> // Have to nest here because all of the query fields are technically Optional, so doing 2 layers gets at whether or not the actual column type is nullable
          ? ExistsComparator<V>
          : Comparator<T>
        : Comparator<T>

type BooleanOperator<T> = {
  or?: Array<QueryFilter<T>>
  and?: Array<QueryFilter<T>>
}

type ThenArg<T> = T extends PromiseLike<infer U> ? U : T

type ArrayArg<T> = T extends Array<infer U> ? U : T

type UnpackedArg<T> = ArrayArg<ThenArg<T>>

type ArrayOperation<T> = {
  any?: Array<QueryFilter<T>>
  all?: Array<QueryFilter<T>>
}

type QueryFilter<T> = {
  [P in keyof T]?: T[P] extends { id: string }
    ? QueryFilter<ThenArg<T[P]>>
    : T[P] extends Array<infer U>
      ? ArrayOperation<U>
      : DynamicComparator<UnpackedArg<T[P]>>
}

type UserFilter<T> = {
  [P in keyof T]?: T[P] extends { id: string } ? UserFilter<ThenArg<T[P]>> | keyof T[P] : UserFilter<UnpackedArg<T[P]>>
}

const RecordScopeCustom = <T>(filter: BooleanOperator<T> | QueryFilter<T>) => {
  return
}

function currentUser<T extends keyof User>(filter: T | QueryFilter<ThenArg<User[T]>>): ComputedValue<T> {
  return {} as any
}


RecordScopeCustom<Post>({
  createdAt: {
    gte: new Date()
  }
})

RecordScopeCustom<Post>({
  or: [
    {
      title: {
        eq: ''
      },
    },
    {
      author: {
        profile: {
          picture: {
            exists: true,
          },
        },
      },
    },
  ],
})

RecordScopeCustom<Post>({
  author: {
    organizations: {
      any: [
        {
          id: {
            eq: 'asdf'
          },
        },
      ],
    },
  },
})

