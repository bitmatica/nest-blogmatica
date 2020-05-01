import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { User } from './user.entity'
import { UsersResolver } from './users.resolver'
import { AuthenticationModule } from '../authentication/authentication.module'

@Module({
  imports: [ TypeOrmModule.forFeature([ User ]), AuthenticationModule ],
  providers: [ UsersResolver ],
})
export class UsersModule {}
