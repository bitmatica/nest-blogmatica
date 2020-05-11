import { HttpService, Injectable } from '@nestjs/common'
import { ModelId } from '../core/model'
import { OAuthService } from '../oauth/oauth.service'
import { OAuthProvider } from '../oauth/oauthtoken.entity'
import { config } from '@creditkarma/dynamic-config'
import { GustoUser } from './gusto.resolver'

@Injectable()
export class GustoService {
  constructor(
    private readonly oauthService: OAuthService,
    private readonly httpService: HttpService,
  ) {}

  async currentUser(userId: ModelId): Promise<GustoUser> {
    const oauthToken = await this.oauthService.getAccessToken(userId, OAuthProvider.GUSTO)
    return this.get('v1/me', oauthToken!.accessToken!)
  }

  async get(path: string, token: string) {
    const url = await this.buildUri(path, OAuthProvider.GUSTO)
    return (await this.getWithBearerToken(url, token!)).data
  }

  async buildUri(path: string, provider: OAuthProvider) {
    const conf = await config().get<any>(this.oauthService.configPath(provider))
    return `${conf.baseApiUri}${path}`
  }

  async getWithBearerToken(url: string, token: string) {
    return this.httpService.get(url, { headers: this.authorizationBearerHeader(token) }).toPromise()
  }

  authorizationBearerHeader(token: string) {
    return {
      Authorization: `Bearer ${token}`,
    }
  }
}
