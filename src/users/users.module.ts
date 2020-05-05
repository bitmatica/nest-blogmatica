import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AuthenticationModule } from '../authentication/authentication.module'
import { User } from './user.entity'
import { UsersResolver } from './users.resolver'
import { UsersService } from './users.service'

@Module({
  imports: [TypeOrmModule.forFeature([User]), AuthenticationModule],
  providers: [UsersResolver, UsersService],
})
export class UsersModule {}
