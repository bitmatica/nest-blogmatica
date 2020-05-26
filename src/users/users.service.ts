import { Injectable } from '@nestjs/common'
import { ModelId } from '../core/model'
import { BaseModelService } from '../core/service/model'
import { User } from './user.entity'

@Injectable()
export class UsersService extends BaseModelService(User) {
  async getByEmail(email: string): Promise<User | undefined> {
    return this.repo.findOne({ email })
  }

  async getById(id: ModelId): Promise<User | undefined> {
    return this.repo.findOne({ id })
  }
}
