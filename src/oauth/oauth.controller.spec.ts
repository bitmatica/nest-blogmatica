import { Test, TestingModule } from '@nestjs/testing'
import { OAuthController } from './oauth.controller'
import { AppModule } from '../app.module'

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
