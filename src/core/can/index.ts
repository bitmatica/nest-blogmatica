import { SetMetadata, Type } from '@nestjs/common'
import { CustomDecorator } from '@nestjs/common/decorators/core/set-metadata.decorator'
import { Reflector } from '@nestjs/core'
import { IContext } from '../context'
import { Permission } from './permissions'
import { ActionScope } from './scopes/action'
import { AllScope, CombinedRecordScope, IRecordScope, RecordScope } from './scopes/record'
import { getUserScopes, UserScope } from './scopes/user'

export const PERMISSION_METADATA_KEY = 'PERMISSION_METADATA_KEY'

export { ActionScope, RecordScope, UserScope }

export interface RegisterPermissionsOptions {
  permissions: Array<Permission>
}

interface IAllScopesOptions {
  except?: Array<ActionScope>
}

export interface ICanDoOptions {
  defaultActionScopes?: Array<ActionScope>
}

export class Can {
  static global = new Can()

  static do(actionOrList: ActionScope | Array<ActionScope>, ...actions: Array<ActionScope>): Permission {
    const allActions = Array.isArray(actionOrList) ? actionOrList.concat(actions) : [ actionOrList ].concat(actions)
    return new Permission().do(...allActions)
  }

  static everything(options?: IAllScopesOptions): Array<ActionScope> {
    return this.global.everything(options)
  }

  static register(options: RegisterPermissionsOptions): CustomDecorator
  static register(...permissions: Array<Permission>): CustomDecorator
  static register(permissionsOrOptions: RegisterPermissionsOptions | Permission, ...permissions: Array<Permission>): CustomDecorator {
    return this.global.registerPermissions(permissionsOrOptions, ...permissions)
  }

  static check<T>(context: IContext, action: ActionScope, to: Type<T>): IRecordScope<T> {
    return this.global.checkPermissions(context, action, to)
  }

  static Scopes = {
    Action: ActionScope,
    Record: RecordScope,
    User: UserScope
  }

  private defaultActionScopes: Array<ActionScope>

  constructor(options?: ICanDoOptions) {
    this.defaultActionScopes = options?.defaultActionScopes || [ ActionScope.Create, ActionScope.Read, ActionScope.Update, ActionScope.Delete ]
  }

  everything(options?: IAllScopesOptions): Array<ActionScope> {
    const except = options?.except || []
    return this.defaultActionScopes.filter(scope => except.indexOf(scope) < 0)
  }

  registerPermissions(permissionsOrOptions: RegisterPermissionsOptions | Permission, ...permissions: Array<Permission>): CustomDecorator {
    const options = permissionsOrOptions instanceof Permission ? { permissions: [ permissionsOrOptions ].concat(...permissions) } : permissionsOrOptions
    return SetMetadata(PERMISSION_METADATA_KEY, options)
  }

  getRegisteredPermissions = <T>(target: Type<T>): RegisterPermissionsOptions | undefined => {
    const reflector = new Reflector()
    return reflector.get<RegisterPermissionsOptions | undefined>(PERMISSION_METADATA_KEY, target)
  }

  checkPermissions<T>(context: IContext, action: ActionScope, to: Type<T>): IRecordScope<T> {
    const entityConfig = this.getRegisteredPermissions(to)
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
}
