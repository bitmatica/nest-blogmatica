import { SetMetadata, Type } from '@nestjs/common'
import { Reflector } from '@nestjs/core'

export const PERMISSION_METADATA_KEY = 'PERMISSION_METADATA_KEY'

type ManagedEntity = Type<any> | Function

export enum UserScope {
  Anyone,
  Authenticated,
}

export enum RecordScope {
  None,
  Owned,
  All,
}

export enum ActionScope {
  Create,
  Read,
  Update,
  Delete,
  Other,
}

export class Permission {
  actions: Array<ActionScope> = []
  recordScope = RecordScope.All
  userScope = UserScope.Anyone
  role = ''

  do(...actions: Array<ActionScope>): Permission {
    this.actions = actions
    return this
  }

  toRecords(recordScope: RecordScope): Permission {
    this.recordScope = recordScope
    return this
  }

  withRole(role: string): Permission {
    this.role = role
    return this
  }

  as(userScope: UserScope): Permission {
    this.userScope = userScope
    return this
  }
}

export interface RegisterPermissionsOptions {
  permissions: Array<Permission>,
  ownershipField?: string
}

export function registerPermissions(options: RegisterPermissionsOptions)
export function registerPermissions(...permissions: Array<Permission>)
export function registerPermissions(permissionsOrOptions: RegisterPermissionsOptions | Permission, ...permissions: Array<Permission>) {
  const options = permissionsOrOptions instanceof Permission ? { permissions: [ permissionsOrOptions ].concat(...permissions) } : permissionsOrOptions
  return SetMetadata(PERMISSION_METADATA_KEY, options)
}

export const getRegisteredPermissions = (target: ManagedEntity): RegisterPermissionsOptions | undefined => {
  const reflector = new Reflector()
  return reflector.get<RegisterPermissionsOptions | undefined>(PERMISSION_METADATA_KEY, target)
}

export interface IUser {
  id: string
  roles: Array<string>
}

export function getUserScopes(user: IUser | undefined): Array<UserScope> {
  if (!user) {
    return [ UserScope.Anyone ]
  }
  return [ UserScope.Anyone, UserScope.Authenticated ]
}

export const FAKE_CURRENT_USER: IUser | undefined = {
  id: '5742eba7-194f-4f37-95fe-fc22adb163b2',
  roles: [ 'postWriter', 'admin' ],
}

export function checkPermissions(user: IUser | undefined, action: ActionScope, to: ManagedEntity): RecordScope {
  const entityConfig = getRegisteredPermissions(to)
  if (!entityConfig) {
    return RecordScope.None
  }

  const currentUserScopes = getUserScopes(user)
  const relevantPermissions = entityConfig.permissions
    .filter(perm => currentUserScopes.indexOf(perm.userScope) >= 0)
    .filter(perm => perm.actions.indexOf(action) >= 0)
    .filter(perm => perm.role ? user.roles.indexOf(perm.role) >= 0 : true)

  const scope = relevantPermissions.reduce((prev: RecordScope, perm: Permission) => {
    return perm.recordScope > prev ? perm.recordScope : prev
  }, RecordScope.None)

  // If there is no user, trying to query for owned records will fail
  return (!user && scope === RecordScope.Owned) ? RecordScope.None : scope
}

export function getOwnershipField(to: ManagedEntity): string {
  const entityConfig = getRegisteredPermissions(to)
  return entityConfig.ownershipField || 'userId'
}

export const Can = {
  do(actionOrList: ActionScope | Array<ActionScope>, ...actions: Array<ActionScope>): Permission {
    const allActions = Array.isArray(actionOrList) ? actionOrList.concat(actions) : [ actionOrList ].concat(actions)
    return new Permission().do(...allActions)
  },
  register: registerPermissions,
  check: checkPermissions,
  ownedBy: getOwnershipField,
  everything: [ ActionScope.Create, ActionScope.Read, ActionScope.Update, ActionScope.Delete ],
}
