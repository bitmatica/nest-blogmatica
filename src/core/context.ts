import { Request, Response } from 'express'
import { User } from '../users/user.entity'

export interface IContext {
  currentUser?: User
  req: Request
  res: Response
}

export const FAKE_CURRENT_USER: User = {
  id: 'af58075c-7f18-4312-90fb-a78ef1bb629a',
  email: '',
  passwordHash: '',
  updatedAt: new Date(),
  posts: Promise.resolve([]),
  async checkPassword(password: string): Promise<boolean> {
    return Promise.resolve(false)
  },
  async setPassword(password: string): Promise<void> {
    return Promise.resolve(undefined)
  },
  comments: Promise.resolve([]),
  createdAt: new Date(),
}

export const FAKE_CONTEXT: IContext = {
  req: undefined as any,
  res: undefined as any,
  currentUser: FAKE_CURRENT_USER,
}
