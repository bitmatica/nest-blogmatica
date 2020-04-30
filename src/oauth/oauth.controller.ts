import { Controller, Get, HttpService, Query } from '@nestjs/common';

class AccessTokenResponse {
  access_token: string
  token_type: string
  expires_in: number
  refresh_token: string
}

@Controller()
export class OauthController {
  constructor(private httpService: HttpService) {}

  @Get('authCallback')
  async authCallback(
    @Query('code') code: string,
  ) {
    console.log('code: ' + code)
    const result = await this.httpService.post(
      'https://api.gusto.com/oauth/token',
      {},
      {
        params: {
          code,
          client_id: 'OVERRIDE_ME',
          client_secret: 'OVERRIDE_ME',
          redirect_uri: 'http://gusto.apps.bitmatica.com/',
          grant_type: 'authorization_code'
        }
      }
    ).toPromise()
    console.log(result)
    return result
  }
}
