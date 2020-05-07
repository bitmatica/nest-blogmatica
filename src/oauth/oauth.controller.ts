import { Controller, Get, HttpService, Query } from '@nestjs/common'
import { config } from '@creditkarma/dynamic-config'

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
  @Get('oauth/apps')
  async apps() {
    return this.getOAuthRedirectUris()
  }

  @Get('oauth/login')
  async root() {
    return `<html><ul>
${(await this.getOAuthRedirectUris()).map(uri => {
  return `<li><a href="${uri}">${uri}</a></li>`
})}
</ul></html>`
  }

  @Get('authCallback')
  async gustoAuthCallback(@Query('code') code: string) {
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
    const result = await this.httpService
      .post(
        uri,
        {},
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          params: {
            code,
            client_id: clientId,
            client_secret: clientSecret,
            redirect_uri: redirectUri,
            grant_type: 'authorization_code',
          },
        },
      )
      .toPromise()
    console.log('getAccessToken result: ' + result)
    try {
      return result.data
    } catch (err) {
      console.log('Unable to parse access_token from response: ' + err)
      return err
    }
  }

  buildAuthorizationUri(
    authorizationUri: string,
    clientId: string,
    redirectUri: string,
    percentEncodeRedirectUri: boolean,
    scope?: string,
  ) {
    return `${authorizationUri}?client_id=${clientId}&redirect_uri=${
      percentEncodeRedirectUri ? encodeURIComponent(redirectUri) : redirectUri
    }&response_type=code${scope ? `&scope=${scope}` : ''}`
  }

  async getOAuthRedirectUris() {
    const configPaths = [
      'oauth.gusto',
      'oauth.zoom',
      'oauth.asana',
      'oauth.slack',
      'oauth.google',
      'oauth.hubspot',
    ]
    return Promise.all(
      configPaths.map(async configPath => {
        const conf = await config().get<any>(configPath)
        return this.buildAuthorizationUri(
          conf.authorizationUri,
          conf.clientId,
          conf.redirectUri,
          conf.percentEncodeRedirectUri,
          conf.scope,
        )
      }),
    )
  }
}
