import { Injectable } from '@nestjs/common'
import { Repository } from 'typeorm'
import { User } from './user.entity'
import { BaseModelService } from '../core/service/model'

@Injectable()
export class UsersService extends BaseModelService(User) {
  constructor(private readonly repo: Repository<User>) {
    super()
  }

  async getByEmail(email: string): Promise<User | undefined> {
    return this.repo.findOne({ email })
  }
}
