import { Controller, Get, Query } from '@nestjs/common'
import { OAuthProvider } from './oauthtoken.entity'
import { OAuthService } from './oauth.service'

@Controller()
export class OAuthController {
  constructor(private readonly oauthService: OAuthService) {}

  @Get('authCallback')
  async gustoAuthCallback(@Query('code') code: string, @Query('state') state: string) {
    try {
      const result = await this.oauthService.getAccessToken(OAuthProvider.GUSTO, code, state)
      console.log('result: ' + result.access_token)
      return 'Success'
    } catch (err) {
      console.error('Error: ' + err)
      return 'Failed'
    }
  }
}
