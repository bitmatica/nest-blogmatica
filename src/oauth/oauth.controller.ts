import { Controller, Get, HttpService, Query } from '@nestjs/common'
import { config } from '@creditkarma/dynamic-config'

class AccessTokenResponse {
  access_token: string
  token_type: string
  expires_in: number
  refresh_token: string
}

@Controller()
export class OAuthController {
  constructor(private httpService: HttpService) {}

  @Get('gustoLogin')
  async root() {
    const conf = await config().get<any>('oauth')
    return `<html><a href="${conf.oauthUrl}">OAuth Login</a></html>`
  }

  @Get('authCallback')
  async authCallback(@Query('code') code: string) {
    const conf = await config().get<any>('oauth')
    const result = await this.httpService
      .post(
        conf.accessTokenUri,
        {},
        {
          params: {
            code,
            client_id: conf.clientId,
            client_secret: conf.clientSecret,
            redirect_uri: conf.redirectUri,
            grant_type: 'authorization_code',
          },
        },
      )
      .toPromise()

    console.log(result)
    // return result.data
  }
}
