import { ActionScope } from './scopes/action'
import { IRecordScope, RecordScope } from './scopes/record'
import { UserScope } from './scopes/user'

export class Permission {
  actions: Array<ActionScope> = []
  recordScope: IRecordScope<any> = RecordScope.All
  userScope = UserScope.Anyone

  do(...actions: Array<ActionScope>): Permission {
    this.actions = actions
    return this
  }

  to(recordScope: IRecordScope<any>): Permission {
    this.recordScope = recordScope
    return this
  }

  as(userScope: UserScope): Permission {
    this.userScope = userScope
    return this
  }
}
