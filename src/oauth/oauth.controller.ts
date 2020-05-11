import { Controller, Get, Query, Res } from '@nestjs/common'
import { OAuthProvider } from './oauthtoken.entity'
import { OAuthService } from './oauth.service'
import { Response } from 'express'

@Controller()
export class OAuthController {
  constructor(private readonly oauthService: OAuthService) {}

  @Get('authCallback')
  async gustoAuthCallback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Res() response: Response,
  ) {
    try {
      const redirectRoute = await this.oauthService.getAccessToken(OAuthProvider.GUSTO, code, state)
      return response.redirect(redirectRoute)
    } catch (err) {
      console.error('Error: ' + err)
      return response.redirect('/oops')
    }
  }
}
