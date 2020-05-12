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

class OAuthUnauthorizedException extends UnauthorizedException {
  getStatus(): number {
    return 403
  }
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

  async getAccessToken(provider: OAuthProvider, code: string, state: string): Promise<OAuthToken> {
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
      if (!oauthRecord || !oauthRecord.nonce || oauthRecord.nonce !== decodedState.nonce) {
        return Promise.reject(new UnauthorizedException())
      }
      return await this.saveAccessToken(oauthRecord, accessTokenResponse)
    } catch (err) {
      return Promise.reject(err)
    }
  }

  async getSavedAccessToken(userId: string, provider: OAuthProvider): Promise<OAuthToken> {
    const queryBuilder = this.oauthRepo.createQueryBuilder('token')
    const token = await queryBuilder
      .select()
      .where('token.userId = :userId', { userId })
      .andWhere('token.provider = :provider', { provider })
      .andWhere('token.accessToken IS NOT NULL')
      .addOrderBy('token.tokenCreatedAt', 'DESC', 'NULLS LAST')
      .getOne()
    if (!token) {
      throw new OAuthUnauthorizedException(`provider ${provider} is not authorized`)
    } else if (token.isExpired()) {
      const response = (await this.refreshAccessToken(provider, token.refreshToken!))!
      await this.saveAccessToken(token, response)
      return token
    }
    return token
  }

  async refreshAccessToken(provider: OAuthProvider, refreshToken: string) {
    return await this.getAccessTokenWithConf(this.configPath(provider), undefined, refreshToken)
  }

  async saveAccessToken(oauthRecord: OAuthToken, accessTokenResponse: IAccessTokenResponse) {
    oauthRecord.accessToken = accessTokenResponse.access_token
    oauthRecord.refreshToken = accessTokenResponse.refresh_token
    oauthRecord.expiresIn = accessTokenResponse.expires_in
    oauthRecord.tokenType = accessTokenResponse.token_type
    oauthRecord.setTokenCreatedAt(accessTokenResponse.created_at)
    return await this.oauthRepo.save(oauthRecord)
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

  async getAccessTokenWithConf(configPath: string, code?: string, refreshToken?: string) {
    const conf = await config().get<any>(configPath)
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
      console.log('codeOrRefreshToken: ' + codeOrRefreshToken.refresh_token)
      const grantType = code ? 'authorization_code' : 'refresh_token'
      console.log('grantType: ' + grantType)
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
      console.log(
        'uri: ' +
          this.httpService.axiosRef.getUri({
            url: uri,
            headers: {
              'Content-Type': contentType,
            },
            params: {
              codeOrRefreshToken,
              client_id: clientId,
              client_secret: clientSecret,
              grant_type: grantType,
              redirect_uri: redirectUri,
            },
          }),
      )
      console.log('getAccessToken result: ' + response)
      return response.data
    } catch (err) {
      console.log('Unable to parse access_token from response: ' + err)
      return err.response.data
    }
  }
}
