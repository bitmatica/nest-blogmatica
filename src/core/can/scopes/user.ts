import { User } from '../../../users/user.entity'

export enum UserScope {
  Anyone,
  Authenticated,
}

export function getUserScopes(user: User | undefined): Array<UserScope> {
  if (!user) {
    return [ UserScope.Anyone ]
  }
  return [ UserScope.Anyone, UserScope.Authenticated ]
}
