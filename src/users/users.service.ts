import { Injectable } from '@nestjs/common'
import { Repository } from 'typeorm'
import { User } from './user.entity'
import { InjectRepository } from '@nestjs/typeorm'

@Injectable()
export class UsersService {
  @InjectRepository(User)
  protected repo: Repository<User>

  async findOne(email: string): Promise<User | undefined> {
    return this.repo.findOne({ email })
  }
}
