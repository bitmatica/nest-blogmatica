import { Controller, Get, HttpService, Query } from '@nestjs/common'
import { config } from '@creditkarma/dynamic-config'

class AccessTokenResponse {
  access_token: string
  token_type: string
  expires_in: number
  refresh_token: string
}

const CLIENT_ID = 'CLIENT_ID_OVERRIDE_ME'
const CLIENT_SECRET = 'CLIENT_SECRET_OVERRIDE_ME'
const REDIRECT_URI = 'http://gusto.apps.bitmatica.com/authCallback'
const REDIRECT_URI_ESCAPED = 'http:%2F%2Fgusto.apps.bitmatica.com%2FauthCallback'

@Controller()
export class OAuthController {
  constructor(private httpService: HttpService) {}

  @Get('gustoLogin')
  async root() {
    const CLIENT_ID = await config().get<string>('OAUTH_CLIENT_ID')
    const OAUTH_URL =
      'https://api.gusto.com/oauth/authorize?client_id=16b6990cb025f55a84a1a7110b3ab799b97f93aabd33b287cf3e4e77b28fc865&redirect_uri=http:%2F%2Fgusto.apps.bitmatica.com%2FauthCallback&response_type=code'
    return `<html><a href="${OAUTH_URL}">OAuth Login</a></html>`
  }

  @Get('authCallback')
  async authCallback(@Query('code') code: string) {
    const CLIENT_ID = await config().get<string>('OAUTH_CLIENT_ID')
    const CLIENT_SECRET = await config().get<string>('OAUTH_CLIENT_ID')
    const result = await this.httpService
      .post(
        'https://api.gusto.com/oauth/token',
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
