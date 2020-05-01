import { Request, Response } from 'express'
import { User } from '../users/user.entity'

export interface IContext {
  currentUser?: User
  req: Request
  res: Response
}
