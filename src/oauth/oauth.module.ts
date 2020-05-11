import { HttpModule, Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { UsersService } from '../users/users.service'
import { User } from '../users/user.entity'
import { OAuthToken } from './oauthtoken.entity'
import { OAuthService } from './oauth.service'
import { OauthResolver } from './oauth.resolver'
import { OAuthController } from './oauth.controller'

@Module({
  imports: [TypeOrmModule.forFeature([OAuthToken]), HttpModule],
  providers: [OAuthService, OauthResolver],
  controllers: [OAuthController],
})
export class OAuthModule {}
