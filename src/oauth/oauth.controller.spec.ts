import { Test, TestingModule } from '@nestjs/testing'
import { OAuthController } from './oauth.controller'
import { OAuthService } from './oauth.service'
import { AppModule } from '../app.module'
import { TypeOrmModule } from '@nestjs/typeorm'
import { OAuthToken } from './oauthtoken.entity'
import { HttpModule } from '@nestjs/common'
import { OAuthResolver } from './oauth.resolver'
import { ConfigService } from '@nestjs/config'

describe('Oauth Controller', () => {
  let controller: OAuthController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    controller = module.get<OAuthController>(OAuthController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })
})
