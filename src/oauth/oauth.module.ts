import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { UsersService } from '../users/users.service'
import { User } from '../users/user.entity'
import { OAuthToken } from './oauthtoken.entity'

@Module({
  imports: [TypeOrmModule.forFeature([OAuthToken, User])],
})
export class OAuthModule {}
