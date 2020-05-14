import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AuthenticationModule } from '../authentication/authentication.module'
import { User } from './user.entity'
import { UsersResolver } from './users.resolver'
import { UsersService } from './users.service'
import { OAuthModule } from '../oauth/oauth.module'

@Module({
  imports: [TypeOrmModule.forFeature([User]), AuthenticationModule, OAuthModule],
  providers: [UsersResolver, UsersService],
  exports: [UsersService],
})
export class UsersModule {}
