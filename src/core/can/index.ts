import { SetMetadata, Type } from '@nestjs/common'
import { CustomDecorator } from '@nestjs/common/decorators/core/set-metadata.decorator'
import { Reflector } from '@nestjs/core'
import { User } from '../../users/user.entity'
import { IContext } from '../context'
import { ActionScope } from './scopes/action'
import { AllScope, CombinedRecordScope, IRecordScope, RecordScope } from './scopes/record'
import { UserScope } from './scopes/user'

export const PERMISSION_METADATA_KEY = 'PERMISSION_METADATA_KEY'

export { ActionScope, RecordScope, UserScope }

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

export interface RegisterPermissionsOptions {
  permissions: Array<Permission>
}

export function registerPermissions(options: RegisterPermissionsOptions): CustomDecorator
export function registerPermissions(...permissions: Array<Permission>): CustomDecorator
export function registerPermissions(permissionsOrOptions: RegisterPermissionsOptions | Permission, ...permissions: Array<Permission>): CustomDecorator {
  const options = permissionsOrOptions instanceof Permission ? { permissions: [ permissionsOrOptions ].concat(...permissions) } : permissionsOrOptions
  return SetMetadata(PERMISSION_METADATA_KEY, options)
}

export const getRegisteredPermissions = <T>(target: Type<T>): RegisterPermissionsOptions | undefined => {
  const reflector = new Reflector()
  return reflector.get<RegisterPermissionsOptions | undefined>(PERMISSION_METADATA_KEY, target)
}

export function getUserScopes(user: User | undefined): Array<UserScope> {
  if (!user) {
    return [ UserScope.Anyone ]
  }
  return [ UserScope.Anyone, UserScope.Authenticated ]
}

export function checkPermissions<T>(context: IContext, action: ActionScope, to: Type<T>): IRecordScope<T> {
  const entityConfig = getRegisteredPermissions(to)
  if (!entityConfig) {
    return RecordScope.None
  }

  const currentUserScopes = getUserScopes(context.currentUser)
  const relevantPermissions = entityConfig.permissions
    .filter(perm => currentUserScopes.indexOf(perm.userScope) >= 0 && perm.actions.indexOf(action) >= 0)

  if (!relevantPermissions.length) {
    return RecordScope.None
  }

  if (relevantPermissions.find(permission => permission.recordScope instanceof AllScope)) {
    return RecordScope.All
  }
  return new CombinedRecordScope(relevantPermissions.map(permission => permission.recordScope))
}

const allActionScopes = [ ActionScope.Create, ActionScope.Read, ActionScope.Update, ActionScope.Delete ]

interface IAllScopesOptions {
  except?: Array<ActionScope>
}

export const Can = {
  do(actionOrList: ActionScope | Array<ActionScope>, ...actions: Array<ActionScope>): Permission {
    const allActions = Array.isArray(actionOrList) ? actionOrList.concat(actions) : [ actionOrList ].concat(actions)
    return new Permission().do(...allActions)
  },
  register: registerPermissions,
  check: checkPermissions,
  everything(options?: IAllScopesOptions): Array<ActionScope> {
    const except = options?.except || []
    return allActionScopes.filter(scope => except.indexOf(scope) < 0)
  },
}
