import { HttpService, Injectable, UnauthorizedException } from '@nestjs/common'
import { OAuthProvider, OAuthToken } from './oauthtoken.entity'
import { ModelId } from '../core/model'
import { Repository } from 'typeorm'
import { Base64 } from 'js-base64'
import { config } from '@creditkarma/dynamic-config'
import { randomBytes } from 'crypto'
import { InjectRepository } from '@nestjs/typeorm'
import { GenerateAuthorizationUriInput } from './oauth.resolver'

interface IOAuthStateParam {
  id: string
  nonce: string
}

class IAccessTokenResponse {
  access_token: string
  refresh_token: string
  expires_in: number
  token_type: string
  created_at?: number
}

@Injectable()
export class OAuthService {
  constructor(
    @InjectRepository(OAuthToken) private readonly oauthRepo: Repository<OAuthToken>,
    private readonly httpService: HttpService,
  ) {}

  async generateAuthorizationUri(
    input: GenerateAuthorizationUriInput,
    userId: ModelId,
  ): Promise<string> {
    const nonce = this.generateNonce()
    const oauthRecord = new OAuthToken()
    oauthRecord.userId = userId
    oauthRecord.nonce = nonce
    oauthRecord.provider = input.provider
    await this.oauthRepo.save(oauthRecord)
    const state = this.encodeState({
      id: oauthRecord.id,
      nonce,
    })
    const conf = await config().get<any>(this.configPath(input.provider))
    return this.buildAuthorizationUri(
      conf.authorizationUri,
      conf.clientId,
      conf.redirectUri,
      conf.percentEncodeRedirectUri,
      state,
      conf.scope,
    )
  }

  async getAndSaveAccessToken(
    provider: OAuthProvider,
    code: string,
    state: string,
  ): Promise<OAuthToken> {
    try {
      const decodedState = this.decodeState(state)
      if (!decodedState) {
        return Promise.reject(new UnauthorizedException())
      }
      const accessTokenResponse = (await this.getAccessTokenWithConf(
        this.configPath(provider),
        code,
      ))!
      const oauthRecord = await this.oauthRepo.findOne({ id: decodedState.id })
      if (!oauthRecord || oauthRecord.nonce !== decodedState.nonce) {
        return Promise.reject(new UnauthorizedException())
      }
      oauthRecord.accessToken = accessTokenResponse.access_token
      oauthRecord.refreshToken = accessTokenResponse.refresh_token
      oauthRecord.expiresIn = accessTokenResponse.expires_in
      oauthRecord.tokenType = accessTokenResponse.token_type
      oauthRecord.tokenCreatedAt = accessTokenResponse.created_at
        ? accessTokenResponse.created_at
        : this.now_unix_seconds()
      return await this.oauthRepo.save(oauthRecord)
    } catch (err) {
      return Promise.reject(err)
    }
  }

  async getAccessToken(userId: string, provider: OAuthProvider) {
    const queryBuilder = this.oauthRepo.createQueryBuilder('token')
    const token = await queryBuilder
      .select()
      .where('token.userId = :userId', { userId })
      .andWhere('token.provider = :provider', { provider })
      .andWhere('token.accessToken IS NOT NULL')
      .addOrderBy('token.tokenCreatedAt', 'DESC', 'NULLS LAST')
      .getOne()

    // TODO refresh token if expired or response is unauthorized
    return token
  }

  now_unix_seconds() {
    return Math.floor(Date.now() / 1000)
  }

  generateNonce() {
    return randomBytes(48).toString('base64')
  }

  encodeState(input: IOAuthStateParam): string {
    return Base64.encode(JSON.stringify({ ...input }))
  }

  decodeState(state: string): IOAuthStateParam | undefined {
    try {
      return JSON.parse(Base64.decode(state))
    } catch (err) {
      return undefined
    }
  }

  configPath(provider: OAuthProvider) {
    return `oauth.${provider.toLocaleLowerCase()}`
  }

  async onSuccessRedirectPath(provider: OAuthProvider) {
    return (await config().get<any>(this.configPath(provider))).onSuccessRedirectPath
  }

  async onFailedRedirectPath(provider: OAuthProvider) {
    return (await config().get<any>(this.configPath(provider))).onFailedRedirectPath
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

  async getAccessTokenWithConf(configPath: string, code: string) {
    const conf = await config().get<any>(configPath)
    return this.fetchAccessToken(
      conf.accessTokenUri,
      code,
      conf.clientId,
      conf.clientSecret,
      conf.redirectUri,
      conf.contentType,
    )
  }

  async fetchAccessToken(
    uri: string,
    code: string,
    clientId: string,
    clientSecret: string,
    redirectUri: string,
    contentType: string,
  ): Promise<IAccessTokenResponse | undefined> {
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

  bearerTokenHeader(token: string) {
    return {
      Authorization: `Bearer ${token}`,
    }
  }
}
