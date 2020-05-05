import { Controller, Get, HttpService, Query } from '@nestjs/common'
import { config } from '@creditkarma/dynamic-config'

class AccessTokenResponse {
  access_token: string
  token_type: string
  expires_in: number
  refresh_token: string
}

const REDIRECT_URI = 'http://gusto.apps.bitmatica.com/authCallback'

@Controller()
export class OAuthController {
  constructor(private httpService: HttpService) {}

  @Get('gustoLogin')
  async root() {
    const OAUTH_URL = await config().get<string>('oauthUrl')
    return `<html><a href="${OAUTH_URL}">OAuth Login</a></html>`
  }

  @Get('authCallback')
  async authCallback(@Query('code') code: string) {
    const CLIENT_ID = await config().get<string>('clientId')
    const CLIENT_SECRET = await config().get<string>('clientSecret')
    const ACCESS_TOKEN_URI = await config().get<string>('accessTokenUri')
    const result = await this.httpService
      .post(
        ACCESS_TOKEN_URI,
        {},
        {
          params: {
            code,
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            redirect_uri: REDIRECT_URI,
            grant_type: 'authorization_code',
          },
        },
      )
      .toPromise()

    console.log(result)
    // return result.data
  }
}
