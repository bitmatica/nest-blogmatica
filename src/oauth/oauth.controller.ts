import {
  Controller,
  Get,
  HttpService,
  Query,
  Request,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common'
import { config } from '@creditkarma/dynamic-config'
import { RestJwtAuthGuard } from '../authentication/guards/jwt-auth.guard'
import { Base64 } from 'js-base64'
import { OAuthProvider, OAuthToken } from './oauthtoken.entity'
import { getConnection } from 'typeorm'
import { randomBytes } from 'crypto'
import { Response } from 'express'

class AccessTokenResponse {
  access_token: string
  refresh_token: string
  expires_in: number
  token_type: string
  created_at?: number
}

interface IOAuthUser {
  id: string
  email: string
}

interface IOAuthStateParam {
  id: string
  nonce: string
}

@Controller()
export class OAuthController {
  constructor(private httpService: HttpService) {}

  @UseGuards(RestJwtAuthGuard)
  @Get('oauth/login')
  async root(@Request() request: Express.Request) {
    const oauthRepo = getConnection().getRepository(OAuthToken)
    const oauthRecord = new OAuthToken()
    oauthRecord.userId = request.user!.id
    oauthRecord.provider = OAuthProvider.GUSTO
    await oauthRepo.save(oauthRecord)
    const state = Base64.encode(JSON.stringify({ nonce: oauthRecord.id }))
    console.log('encoded state: ' + state)
    return `<html><ul>
${(await this.getOAuthRedirectUris(state)).map(uri => {
  return `<li><a href="${uri}">${uri}</a></li>`
})}
</ul></html>`
  }

  @UseGuards(RestJwtAuthGuard)
  @Get('auth/gusto')
  async gustoLogin(@Request() request: Express.Request, @Res() response: Response) {
    const oauthRepo = getConnection().getRepository(OAuthToken)
    const nonce = this.generateNonce()
    const oauthRecord = new OAuthToken()
    oauthRecord.userId = request.user!.id
    oauthRecord.nonce = nonce
    oauthRecord.provider = OAuthProvider.GUSTO
    await oauthRepo.save(oauthRecord)
    const state = Base64.encode(JSON.stringify({ id: oauthRecord.id, nonce }))
    const conf = await config().get<any>('oauth.gusto')
    const uri = this.buildAuthorizationUri(
      conf.authorizationUri,
      conf.clientId,
      conf.redirectUri,
      conf.percentEncodeRedirectUri,
      state,
      conf.scope,
    )
    console.log('uri: ' + uri)
    // return uri
    return response.redirect(uri)
  }

  @Get('authCallback')
  async gustoAuthCallback(@Query('code') code: string, @Query('state') state: string) {
    console.log('encoded state: ' + state)
    const decodedState: IOAuthStateParam = JSON.parse(Base64.decode(state))
    console.log('decoded state: ' + decodedState)
    const accessTokenResponse = (await this.getAccessTokenWithConf('oauth.gusto', code))!
    const oauthRepo = getConnection().getRepository(OAuthToken)
    const oauthRecord = await oauthRepo.findOne({ id: decodedState.id })
    if (!oauthRecord) {
      console.error('Could not find oauth request record')
      throw new UnauthorizedException()
    } else if (oauthRecord.nonce !== decodedState.nonce) {
      console.error('Nonce in state does not match request nonce')
      throw new UnauthorizedException()
    } else {
      oauthRecord.accessToken = accessTokenResponse.access_token
      oauthRecord.refreshToken = accessTokenResponse.refresh_token
      oauthRecord.expiresIn = accessTokenResponse.expires_in
      oauthRecord.tokenType = accessTokenResponse.token_type
      oauthRecord.tokenCreatedAt = accessTokenResponse.created_at
        ? accessTokenResponse.created_at
        : Math.floor(Date.now() / 1000)
      await oauthRepo.save(oauthRecord)
      return accessTokenResponse
    }
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

  generateNonce() {
    return randomBytes(48).toString('base64')
  }
}
