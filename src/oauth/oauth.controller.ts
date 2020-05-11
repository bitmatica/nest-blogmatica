import { Controller, Get, Query, Res } from '@nestjs/common'
import { OAuthProvider } from './oauthtoken.entity'
import { OAuthService } from './oauth.service'
import { Response } from 'express'

const ON_SUCCESS_PATH = '/gusto/success'
const ON_FAILED_PATH = '/gusto/failed'

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
      await this.oauthService.getAndSaveAccessToken(OAuthProvider.GUSTO, code, state)
      return response.redirect(ON_SUCCESS_PATH)
    } catch (err) {
      console.error('Error: ' + err)
      return response.redirect(ON_FAILED_PATH)
    }
  }
}
