import { Post } from '../../../../posts/post.entity'
import { User } from '../../../../users/user.entity'
import { parseScope } from './parser'
import { BooleanOperator, ComputedValue, QueryFilter } from './types'

export const RecordScopeCustom = <T>(filter: BooleanOperator<T> | QueryFilter<T>) => {
  parseScope(filter)
  return
}

export const CurrentUser: ComputedValue<User> = {
  value: (context: any): User => {
    return {} as User
  },
  get: <T extends keyof User>(key: T): ComputedValue<T> => {
    return {
      computedField: key
    } as any
  }
} as ComputedValue<User>

RecordScopeCustom<Post>({
  createdAt: CurrentUser.get('createdAt'),
})

RecordScopeCustom<User>({
  posts: {
    $all: [{
      id: ''
    }]
  }
})

RecordScopeCustom<Post>({
  createdAt: {
    $gte: CurrentUser.get('createdAt'),
  },
})

RecordScopeCustom<Post>({
  author: {
    posts: {

    }
  },
})

RecordScopeCustom<Post>({
  $or: [
    {
      author: {
        id: {
          $eq: CurrentUser.get('id')
        }
      }
    },
    {
      createdAt: {
        $gte: CurrentUser.get('createdAt')
      }
    }
  ]
})
