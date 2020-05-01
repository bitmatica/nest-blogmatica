import { Request, Response } from 'express'

export interface IUser {
  id: string
}

export interface IContext {
  user?: IUser
  req: Request
  res: Response
}
