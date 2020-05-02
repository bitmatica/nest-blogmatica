import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AuthenticationModule } from '../authentication/authentication.module'
import { User } from './user.entity'
import { UsersResolver } from './users.resolver'

@Module({
  imports: [TypeOrmModule.forFeature([User]), AuthenticationModule],
  providers: [UsersResolver],
})
export class UsersModule {}
