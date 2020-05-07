import { Controller, Get, HttpService, Query, Request, UseGuards } from '@nestjs/common'
import { config } from '@creditkarma/dynamic-config'
import { RestJwtAuthGuard } from '../authentication/guards/jwt-auth.guard'
import { Base64 } from 'js-base64'

class AccessTokenResponse {
  access_token: string
  refresh_token: string
  created_at: number
  expires_in: number
  token_type: string
}

interface IOAuthUser {
  id: string
  email: string
}

@Controller()
export class OAuthController {
  constructor(private httpService: HttpService) {}

  @UseGuards(RestJwtAuthGuard)
  @Get('oauth/login')
  async root(@Request() request: Express.Request) {
    const state = Base64.encode(`{ "userId": "${request.user!.id}" }`)
    console.log('userId: ' + request.user!.id)
    console.log('encoded state: ' + state)
    return `<html><ul>
${(await this.getOAuthRedirectUris(state)).map(uri => {
  return `<li><a href="${uri}">${uri}</a></li>`
})}
</ul></html>`
  }

  @Get('authCallback')
  async gustoAuthCallback(@Query('code') code: string, @Query('state') state: string) {
    console.log('encoded state: ' + state)
    console.log('decoded state: ' + Base64.decode(state))
    return this.getAccessTokenWithConf('oauth.gusto', code)
  }

  @Get('auth/asana/callback')
  async asanaAuthCallback(@Query('code') code: string) {
    return this.getAccessTokenWithConf('oauth.asana', code)
  }

  @Get('auth/zoom/callback')
  async zoomAuthCallback(@Query('code') code: string) {
    return this.getAccessTokenWithConf('oauth.zoom', code)
  }

  @Get('auth/slack/callback')
  async slackAuthCallback(@Query('code') code: string) {
    return this.getAccessTokenWithConf('oauth.slack', code)
  }

  @Get('auth/google/callback')
  async googleAuthCallback(@Query('code') code: string) {
    return this.getAccessTokenWithConf('oauth.google', code)
  }

  @Get('auth/hubspot/callback')
  async hubspotAuthCallback(@Query('code') code: string) {
    return this.getAccessTokenWithConf('oauth.hubspot', code)
  }

  async getAccessTokenWithConf(configPath: string, code: string) {
    const conf = await config().get<any>(configPath)
    return this.getAccessToken(
      conf.accessTokenUri,
      code,
      conf.clientId,
      conf.clientSecret,
      conf.redirectUri,
      conf.contentType,
    )
  }

  async getAccessToken(
    uri: string,
    code: string,
    clientId: string,
    clientSecret: string,
    redirectUri: string,
    contentType: string,
  ): Promise<AccessTokenResponse | undefined> {
    console.log('AUTH CALLBACK')
    console.log(uri)
    console.log(code)
    console.log(clientId)
    console.log(clientSecret)
    console.log(redirectUri)
    console.log(contentType)
    try {
      const response = await this.httpService
        .post(
          uri,
          {},
          {
            headers: {
              'Content-Type': contentType,
            },
            params: {
              code,
              client_id: clientId,
              client_secret: clientSecret,
              grant_type: 'authorization_code',
              redirect_uri: redirectUri,
            },
          },
        )
        .toPromise()
      console.log('getAccessToken result: ' + response)
      return response.data
    } catch (err) {
      console.log('Unable to parse access_token from response: ' + err)
      return err.response.data
    }
  }

  async getOAuthRedirectUris(state: string) {
    const oauthConf = await config().get<any>('oauth')
    const configPaths = Object.keys(oauthConf)
    return Promise.all(
      configPaths.map(async configPath => {
        const conf = await oauthConf[configPath]
        return this.buildAuthorizationUri(
          conf.authorizationUri,
          conf.clientId,
          conf.redirectUri,
          conf.percentEncodeRedirectUri,
          state,
          conf.scope,
        )
      }),
    )
  }

  buildAuthorizationUri(
    authorizationUri: string,
    clientId: string,
    redirectUri: string,
    percentEncodeRedirectUri: boolean,
    state?: string,
    scope?: string,
  ) {
    return `${authorizationUri}?client_id=${clientId}&redirect_uri=${
      percentEncodeRedirectUri ? encodeURIComponent(redirectUri) : redirectUri
    }&response_type=code${scope ? `&scope=${scope}` : ''}${state ? `&state=${state}` : ''}`
  }
}
