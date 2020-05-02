import { IContext } from '../../context'

export interface IUserScope {
  applies(context: IContext): boolean
}

export abstract class BaseUserScope implements IUserScope {
  abstract applies(context: IContext): boolean
}

export class AnyoneUserScope extends BaseUserScope {
  applies(context: IContext): boolean {
    return true
  }
}

export class AuthenticatedUserScope extends BaseUserScope {
  applies(context: IContext): boolean {
    return !!context.user
  }
}

export type ApplyChecker = (context: IContext) => boolean

export class WhereUserScope extends BaseUserScope {
  constructor(private checker: ApplyChecker) {
    super()
  }

  applies(context: IContext): boolean {
    return this.checker(context)
  }
}

export abstract class UserScope {
  static Anyone = new AnyoneUserScope()
  static Authenticated = new AuthenticatedUserScope()
  static Where = (checker: ApplyChecker) => new WhereUserScope(checker)
  static WithRole = (role: string) =>
    new WhereUserScope(context => {
      const roles = context.user?.roles
      return !!roles && roles.indexOf(role) >= 0
    })
}
