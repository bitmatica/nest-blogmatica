import { IUser } from '../../context'

export enum UserScope {
  Anyone,
  Authenticated,
}

export function getUserScopes(user: IUser | undefined): Array<UserScope> {
  if (!user) {
    return [ UserScope.Anyone ]
  }
  return [ UserScope.Anyone, UserScope.Authenticated ]
}
