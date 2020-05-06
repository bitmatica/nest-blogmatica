import { SetMetadata, Type } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import every from 'lodash/every'
import isArray from 'lodash/isArray'
import { IContext } from '../context'
import { Permission } from './permission'
import { ActionScope } from './scopes/action'
import { AllRecordScope, CombinedRecordScope, IRecordScope, RecordScope } from './scopes/record'
import { IUserScope, UserScope } from './scopes/user'

export const PERMISSION_METADATA_KEY = 'PERMISSION_METADATA_KEY'

export { ActionScope, RecordScope, UserScope }

interface IAllScopesOptions {
  except?: Array<ActionScope>
}

export interface ICanDoOptions {
  defaultActionScopes?: Array<ActionScope>
}

export interface IBasePermissionOptions<T> {
  to?: IRecordScope<T>
  as?: IUserScope
}

export interface IPermissionsWithActions<T> extends IBasePermissionOptions<T> {
  do: Array<ActionScope>
}

export class PermissionGroup<T> {
  readonly registeredPermissions: Array<Permission<T>>

  constructor(private classType: Type<T>, initialPermissions?: Array<Permission<T>>) {
    this.registeredPermissions = initialPermissions || []
  }

  doAll(...perms: Array<Permission<T>>): this {
    this.registeredPermissions.concat(perms)
    return this
  }

  do(options: IPermissionsWithActions<T>): this
  do(action: ActionScope, options?: IBasePermissionOptions<T>): this
  do(actions: Array<ActionScope>, options?: IBasePermissionOptions<T>): this
  do(
    actionOrOptions: ActionScope | Array<ActionScope> | IPermissionsWithActions<T>,
    options?: IBasePermissionOptions<T>,
  ): this {
    const actions: Array<ActionScope> = []
    if (actionOrOptions instanceof ActionScope) {
      actions.push(actionOrOptions)
    } else if (isArray(actionOrOptions)) {
      actions.push(...actionOrOptions)
    } else {
      actions.concat(...(actionOrOptions.do || []))
    }

    const perm = new Permission<T>().do(...actions)

    const mergedOptions =
      actionOrOptions instanceof ActionScope || isArray(actionOrOptions) ? options : actionOrOptions
    if (mergedOptions?.to) {
      perm.to(mergedOptions.to)
    }
    if (mergedOptions?.as) {
      perm.as(mergedOptions.as)
    }

    this.registeredPermissions.push(perm)
    return this
  }
}

export class Can {
  static global = new Can()
  static Scopes = {
    Action: ActionScope,
    Record: RecordScope,
    User: UserScope,
  }
  private defaultActionScopes: Array<ActionScope>

  constructor(options?: ICanDoOptions) {
    this.defaultActionScopes = options?.defaultActionScopes || [
      ActionScope.Create,
      ActionScope.Read,
      ActionScope.Update,
      ActionScope.Delete,
    ]
  }

  static everything(options?: IAllScopesOptions): Array<ActionScope> {
    return this.global.everything(options)
  }

  static register<T>(classType: Type<T>, permissions?: Array<Permission<T>>): PermissionGroup<T> {
    const permissionGroup = new PermissionGroup(classType, permissions)
    this.global.registerPermissions(classType, permissionGroup)

    return permissionGroup
  }

  static check<T>(context: IContext, action: ActionScope, to: Type<T>): IRecordScope<T> {
    return this.global.checkPermissions(context, action, to)
  }

  static checkRequiresAuthentication<T>(target: Type<T>, ...actions: Array<ActionScope>): boolean {
    const permissions = this.global.getRegisteredPermissions(target)?.registeredPermissions
    if (!permissions) {
      return true // TODO: What to do by default when no registered permissions
    }

    return !every(
      actions.map(action => {
        return permissions.filter(
          p => p.userScope === UserScope.Anyone && p.actions.indexOf(action) >= 0,
        ).length
      }),
    )
  }

  everything(options?: IAllScopesOptions): Array<ActionScope> {
    const except = options?.except || []
    return this.defaultActionScopes.filter(scope => except.indexOf(scope) < 0)
  }

  registerPermissions<T>(classType: Type<T>, permissionGroup: PermissionGroup<T>) {
    SetMetadata(PERMISSION_METADATA_KEY, permissionGroup)(classType)
  }

  getRegisteredPermissions<T>(target: Type<T>): PermissionGroup<T> | undefined {
    const reflector = new Reflector()
    return reflector.get<PermissionGroup<T> | undefined>(PERMISSION_METADATA_KEY, target)
  }

  checkPermissions<T>(context: IContext, action: ActionScope, to: Type<T>): IRecordScope<T> {
    const permissionGroup = this.getRegisteredPermissions(to)
    if (!permissionGroup || !permissionGroup.registeredPermissions.length) {
      return RecordScope.None
    }

    const relevantPermissions = permissionGroup.registeredPermissions.filter(
      perm => perm.userScope.applies(context) && perm.actions.indexOf(action) >= 0,
    )

    if (!relevantPermissions.length) {
      return RecordScope.None
    }

    if (relevantPermissions.find(permission => permission.recordScope instanceof AllRecordScope)) {
      return RecordScope.All
    }
    return new CombinedRecordScope(relevantPermissions.map(permission => permission.recordScope))
  }
}
