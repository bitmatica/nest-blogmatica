import { Controller, Get, HttpService, Query } from '@nestjs/common'
import { config } from '@creditkarma/dynamic-config'
import { OAuthToken, OAuthProvider } from './oauthtoken.entity'
import { getConnection } from 'typeorm'
import { User } from '../users/user.entity'

class AccessTokenResponse {
  access_token: string
  refresh_token: string
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

  @Get('oauth/login')
  async root() {
    const conf = await config().get<any>('oauth')
    const uri = `${conf.authorizationUri}?client_id=${
      conf.clientId
    }&redirect_uri=${encodeURIComponent(conf.redirectUri)}&response_type=code`

    return `<html><ul>
<li><a href="${this.buildAuthorizationUri(
      conf.gusto.authorizationUri,
      conf.gusto.clientId,
      conf.gusto.redirectUri,
    )}">Gusto Login</a></li>
<li><a href="${this.buildAuthorizationUri(
      conf.asana.authorizationUri,
      conf.asana.clientId,
      conf.asana.redirectUri,
    )}">Asana Login</a></li>
<li><a href="${this.buildAuthorizationUri(
      conf.google.authorizationUri,
      conf.google.clientId,
      conf.google.redirectUri,
    )}">Google Login</a></li>
</ul>
</html>`
  }

  @Get('authCallback')
  async gustoAuthCallback(@Query('code') code: string) {
    const conf = await config().get<any>('oauth')
    const response: AccessTokenResponse = (await this.getAccessToken(
      conf.gusto.accessTokenUri,
      code,
      conf.gusto.clientId,
      conf.gusto.clientSecret,
      conf.gusto.redirectUri,
    ))!
    const userRepository = getConnection().getRepository(User)
    const oauthRepository = getConnection().getRepository(OAuthToken)
    console.log('gusto response: ', response)
    const gustoUser = await this.getUser(response.access_token)
    console.log('gusto user: ' + gustoUser)
    // Try to match on email
    const dbUser = await userRepository.findOne({ email: gustoUser.email })
    console.log('db user: ' + dbUser)
    const oAuth: OAuthToken = new OAuthToken()
    oAuth.accessToken = response.access_token
    oAuth.refreshToken = response.refresh_token
    oAuth.expiresIn = response.expires_in
    oAuth.tokenType = response.token_type
    oAuth.provider = OAuthProvider.GUSTO
    oAuth.userId = dbUser!.id
    await oauthRepository.save(oAuth)
    return oAuth
  }

  @Get('auth/asana/callback')
  async asanaAuthCallback(@Query('code') code: string) {
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
  async googleAuthCallback(@Query('code') code: string) {
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
  ): Promise<AccessTokenResponse | undefined> {
    console.log('AUTH CALLBACK')
    console.log(uri)
    console.log(code)
    console.log(clientId)
    console.log(clientSecret)
    console.log(redirectUri)
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
      return result.data
    } catch (err) {
      console.log('Unable to parse access_token from response')
      return err
    }
  }

  buildAuthorizationUri(authorizationUri: string, clientId: string, redirectUri: string) {
    return `${authorizationUri}?client_id=${clientId}&redirect_uri=${encodeURIComponent(
      redirectUri,
    )}&response_type=code`
  }

  async getUser(token: string): Promise<IOAuthUser> {
    const conf = await config().get<any>('oauth')
    const result = await this.httpService
      .get(conf.getUserUri, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .toPromise()
    return result.data
  }
}
