import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { OAuthModule } from '../oauth/oauth.module'
import { User } from './user.entity'
import { UsersResolver } from './users.resolver'
import { UsersService } from './users.service'

@Module({
  imports: [TypeOrmModule.forFeature([User]), OAuthModule],
  providers: [UsersResolver, UsersService],
  exports: [UsersService],
})
export class UsersModule {}
