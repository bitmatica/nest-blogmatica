import { ActionScope } from './scopes/action'
import { IRecordScope, RecordScope } from './scopes/record'
import { UserScope } from './scopes/user'

export class Permission<T> {
  actions: Array<ActionScope> = []
  recordScope: IRecordScope<T> = RecordScope.All
  userScope = UserScope.Anyone

  do(...actions: Array<ActionScope>): Permission<T> {
    this.actions = actions
    return this
  }

  to(recordScope: IRecordScope<T>): Permission<T> {
    this.recordScope = recordScope
    return this
  }

  as(userScope: UserScope): Permission<T> {
    this.userScope = userScope
    return this
  }
}
