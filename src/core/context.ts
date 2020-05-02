import { Request, Response } from 'express'
import { ModelId } from './model'

export interface IUser {
  id: ModelId
  roles: Array<string>
}

export interface IContext {
  user?: IUser
  req: Request
  res: Response
}
