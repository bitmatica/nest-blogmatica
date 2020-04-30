import { User } from '../users/user.entity';
import { Request, Response } from 'express';

export interface IContext {
  currentUser?: User
  req: Request
  res: Response
}
