import { User } from '../users/user.entity';
import { Request, Response } from 'express';

export interface IContext {
  user?: User
  req: Request
  res: Response
}
