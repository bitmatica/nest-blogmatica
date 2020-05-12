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
      await this.oauthService.getAccessTokenWithCode(OAuthProvider.GUSTO, code, state)
      const redirectUri = await this.oauthService.onSuccessRedirectPath(OAuthProvider.GUSTO)
      return response.redirect(redirectUri)
    } catch (err) {
      console.error('Error: ' + err)
      const redirectUri = await this.oauthService.onFailedRedirectPath(OAuthProvider.GUSTO)
      return response.redirect(redirectUri)
    }
  }
}
