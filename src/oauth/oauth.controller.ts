import { Controller, Get, HttpService, Query } from '@nestjs/common'
import { config } from '@creditkarma/dynamic-config'

class AccessTokenResponse {
  access_token: string
}

@Controller()
export class OAuthController {
  constructor(private httpService: HttpService) {}

  @Get('oauth/login')
  async root() {
    const conf = await config().get<any>('oauth')
    const uri = `${conf.baseUri}?client_id=${conf.clientId}&redirect_uri=${encodeURIComponent(
      conf.redirectUri,
    )}&response_type=code`

    return `<html><ul>
<li><a href="${this.buildAuthorizationUri(
      conf.gusto.baseUri,
      conf.gusto.clientId,
      conf.gusto.redirectUri,
    )}">Gusto Login</a></li>
<li><a href="${this.buildAuthorizationUri(
      conf.asana.baseUri,
      conf.asana.clientId,
      conf.asana.redirectUri,
    )}">Asana Login</a></li>
<li><a href="${this.buildAuthorizationUri(
      conf.google.baseUri,
      conf.google.clientId,
      conf.google.redirectUri,
    )}">Google Login</a></li>
</ul>
</html>`
  }

  @Get('authCallback')
  async gustoAuthCallback(@Query('code') code: string): Promise<string | undefined> {
    const conf = await config().get<any>('oauth')
    return this.getAccessToken(
      conf.gusto.accessTokenUri,
      code,
      conf.gusto.clientId,
      conf.gusto.clientSecret,
      conf.gusto.redirectUri,
    )
  }

  @Get('auth/asana/callback')
  async asanaAuthCallback(@Query('code') code: string): Promise<string | undefined> {
    const conf = await config().get<any>('oauth')
    return this.getAccessToken(
      conf.asana.accessTokenUri,
      code,
      conf.asana.clientId,
      conf.asana.clientSecret,
      conf.asana.redirectUri,
    )
  }

  @Get('auth/google/callback')
  async googleAuthCallback(@Query('code') code: string): Promise<string | undefined> {
    const conf = await config().get<any>('oauth')
    return this.getAccessToken(
      conf.asana.accessTokenUri,
      code,
      conf.asana.clientId,
      conf.asana.clientSecret,
      conf.asana.redirectUri,
    )
  }

  async getAccessToken(
    uri: string,
    code: string,
    clientId: string,
    clientSecret: string,
    redirectUri: string,
  ): Promise<string | undefined> {
    const result = await this.httpService
      .post(
        uri,
        {},
        {
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
      return result.data.access_token
    } catch (err) {
      console.log('Unable to parse access_token from response')
      return err
    }
  }

  buildAuthorizationUri(baseUri: string, clientId: string, redirectUri: string) {
    return `${baseUri}?client_id=${clientId}&redirect_uri=${encodeURIComponent(
      redirectUri,
    )}&response_type=code`
  }

  // async getUser(token: string) {
  //   const conf = await config().get<any>('oauth')
  //   const result = await this.httpService
  //     .get(conf.getUserUri, {
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //       },
  //     })
  //     .toPromise()
  //   console.log('getUser: ' + JSON.stringify(result.data))
  // }
}
