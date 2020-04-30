import { Controller, Get, HttpService, Query } from '@nestjs/common';

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
export class OauthController {
  constructor(private httpService: HttpService) {}

  @Get('gustoLogin')
  root() {
    return `<html><a href="https://api.gusto.com/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI_ESCAPED}&response_type=code">Authorize with Gusto</a></html>`
  }

  @Get('authCallback')
  async authCallback(
    @Query('code') code: string,
  ) {
    const result = await this.httpService.post(
      'https://api.gusto.com/oauth/token',
      {},
      {
        params: {
          code,
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET,
          redirect_uri: REDIRECT_URI,
          grant_type: 'authorization_code'
        }
      }
    ).toPromise()

    console.log(result)
    // return result.data
  }
}
