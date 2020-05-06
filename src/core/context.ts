import { Request, Response } from 'express'
import { ModelId } from './model'

export interface IUser {
  id: ModelId
  roles: Array<string>
}

export interface IContext {
  req: Request
  res: Response
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface User {
      id: ModelId
      roles: Array<string>
    }
  }
}
