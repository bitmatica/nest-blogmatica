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
    const uri = `${conf.baseUri}?client_id=${conf.clientId}&redirect_uri=${encodeURIComponent(
      conf.redirectUri,
    )}&response_type=code`

    const c = {
      url: conf.getUserUri,
      headers: {
        Authorization: `'Bearer ${1}'`,
      },
    }
    return `<html><a href="${uri}">OAuth Login</a></html>`
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
    console.log(result.data)

    try {
      const token = result.data.access_token
      await this.getUser(token)
    } catch (err) {
      console.log('Unable to parse access_token from response')
    }
  }

  async getUser(token: string) {
    const conf = await config().get<any>('oauth')
    const result = await this.httpService
      .get(conf.getUserUri, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .toPromise()
    console.log('getUser: ' + JSON.stringify(result.data))
  }
}
