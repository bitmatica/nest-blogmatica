/* eslint-disable @typescript-eslint/camelcase */
import { HttpService, Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { InjectRepository } from '@nestjs/typeorm'
import { Base64 } from 'js-base64'
import { Repository } from 'typeorm'
import { IOAuthProviderConfig } from '../config/oauthConfig'
import { ModelId } from '../core/model'
import { OAuthProvider, OAuthToken } from './oauthtoken.entity'
import { generateNonce } from '../core/utils'

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
    private readonly configService: ConfigService,
  ) {}

  async generateAuthorizationUri(provider: OAuthProvider, userId: ModelId): Promise<string> {
    const nonce = generateNonce()

    const oauthRecord = new OAuthToken()
    oauthRecord.userId = userId
    oauthRecord.nonce = nonce
    oauthRecord.provider = provider
    await this.oauthRepo.save(oauthRecord)

    const state = this.encodeState({
      id: oauthRecord.id,
      nonce,
    })
    const conf = this.config(provider)
    return this.buildAuthorizationUri(
      conf.authorizationUri,
      conf.clientId,
      conf.redirectUri,
      conf.percentEncodeRedirectUri,
      state,
      conf.scope,
    )
  }

  async getAccessToken(provider: OAuthProvider, code: string, state: string): Promise<OAuthToken> {
    try {
      const decodedState = this.decodeState(state)
      if (!decodedState) {
        return Promise.reject(new UnauthorizedException())
      }
      const accessTokenResponse = await this.getAccessTokenWithConf(provider, code)
      if (!accessTokenResponse) { throw new Error("no access token found") }
      const oauthRecord = await this.oauthRepo.findOne({ id: decodedState.id })
      if (!oauthRecord || !oauthRecord.nonce || oauthRecord.nonce !== decodedState.nonce) {
        return Promise.reject(new UnauthorizedException())
      }
      return await this.saveAccessToken(oauthRecord, accessTokenResponse)
    } catch (err) {
      return Promise.reject(err)
    }
  }

  async getOrRefreshSavedAccessToken(
    userId: string,
    provider: OAuthProvider,
  ): Promise<OAuthToken | undefined> {
    // TODO add in-memory cache to save db query for every oauth provider request
    const queryBuilder = this.oauthRepo.createQueryBuilder('token')
    const token = await queryBuilder
      .select()
      .where('token.userId = :userId', { userId })
      .andWhere('token.provider = :provider', { provider })
      .andWhere('token.accessToken IS NOT NULL')
      .addOrderBy('token.tokenCreatedAt', 'DESC', 'NULLS LAST')
      .getOne()
    if (!token?.refreshToken) {
      return undefined
    } else if (token.isExpired()) {
      const refreshToken = await this.refreshAccessToken(provider, token.refreshToken)
      await this.saveAccessToken(token, refreshToken)
    }
    return token
  }

  async refreshAccessToken(provider: OAuthProvider, refreshToken: string) {
    const accessToken = await this.getAccessTokenWithConf(provider, undefined, refreshToken)
    if (!accessToken) { throw new Error("error getting accessToken") }
    return accessToken
  }

  async saveAccessToken(oauthRecord: OAuthToken, accessTokenResponse: IAccessTokenResponse) {
    oauthRecord.accessToken = accessTokenResponse.access_token
    oauthRecord.refreshToken = accessTokenResponse.refresh_token
    oauthRecord.expiresIn = accessTokenResponse.expires_in
    oauthRecord.tokenType = accessTokenResponse.token_type
    oauthRecord.setTokenCreatedAt(accessTokenResponse.created_at)
    return await this.oauthRepo.save(oauthRecord)
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

  config(provider: OAuthProvider): IOAuthProviderConfig {
    const config = this.configService.get<IOAuthProviderConfig>(`oauth.${provider}`)
    if (!config) {
      throw new Error(`No config found for oauth provider: ${provider}`)
    }
    return config
  }

  async onSuccessRedirectPath(provider: OAuthProvider): Promise<string> {
    return this.config(provider).onSuccessRedirectPath
  }

  async onFailedRedirectPath(provider: OAuthProvider): Promise<string> {
    return this.config(provider).onFailedRedirectPath
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

  async getAccessTokenWithConf(provider: OAuthProvider, code?: string, refreshToken?: string) {
    const conf = this.config(provider)
    return this.fetchAccessToken(
      conf.accessTokenUri,
      conf.clientId,
      conf.clientSecret,
      conf.redirectUri,
      conf.contentType,
      code,
      refreshToken,
    )
  }

  async fetchAccessToken(
    uri: string,
    clientId: string,
    clientSecret: string,
    redirectUri: string,
    contentType: string,
    code?: string,
    refreshToken?: string,
  ): Promise<IAccessTokenResponse | undefined> {
    try {
      const codeOrRefreshToken = code ? { code } : { refresh_token: refreshToken }
      const grantType = code ? 'authorization_code' : 'refresh_token'
      const response = await this.httpService
        .post(
          uri,
          {},
          {
            headers: {
              'Content-Type': contentType,
            },
            params: {
              ...codeOrRefreshToken,
              client_id: clientId,
              client_secret: clientSecret,
              grant_type: grantType,
              redirect_uri: redirectUri,
            },
          },
        )
        .toPromise()
      return response.data
    } catch (err) {
      console.error('Unable to parse access_token from response: ' + err)
      return undefined
    }
  }
}
