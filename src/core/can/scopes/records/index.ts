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
      computedField: key,
    } as any
  },
} as ComputedValue<User>
