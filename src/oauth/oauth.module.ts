import { HttpModule, Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { OAuthToken } from './oauthtoken.entity'
import { OAuthService } from './oauth.service'
import { OAuthResolver } from './oauth.resolver'
import { OAuthController } from './oauth.controller'

@Module({
  imports: [TypeOrmModule.forFeature([OAuthToken]), HttpModule],
  providers: [OAuthService, OAuthResolver],
  controllers: [OAuthController],
  exports: [OAuthService],
})
export class OAuthModule {}
