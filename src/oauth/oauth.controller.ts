import { Controller, Get, Param, Query, Req, Res, UseGuards } from '@nestjs/common'
import { OAuthProvider } from './oauthtoken.entity'
import { OAuthService } from './oauth.service'
import { Request, Response } from 'express'
import { RestJwtAuthGuard } from '../authentication/guards/jwt-auth.guard'

@Controller()
export class OAuthController {
  constructor(private readonly oauthService: OAuthService) {}

  // Included in case a server-side redirect to oauth consent screen is preferred to graphql mutation (in oauth.resolver.ts)
  @UseGuards(RestJwtAuthGuard)
  @Get('auth/:provider')
  async authorizationUri(
    @Param('provider') provider: OAuthProvider,
    @Req() request: Request,
    @Res() response: Response,
  ) {
    if (!request.user) { throw new Error("no user to authorize") }
    const uri = await this.oauthService.generateAuthorizationUri(provider, request.user.id)
    response.redirect(uri)
  }

  @Get('authCallback')
  async gustoAuthCallback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Res() response: Response,
  ) {
    try {
      await this.oauthService.getAccessToken(OAuthProvider.GUSTO, code, state)
      const redirectUri = await this.oauthService.onSuccessRedirectPath(OAuthProvider.GUSTO)
      return response.redirect(redirectUri)
    } catch (err) {
      console.error(err)
      const redirectUri = await this.oauthService.onFailedRedirectPath(OAuthProvider.GUSTO)
      return response.redirect(redirectUri)
    }
  }
}
