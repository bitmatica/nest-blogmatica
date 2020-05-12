import { ForbiddenException, HttpService, Injectable } from '@nestjs/common'
import { ModelId } from '../core/model'
import { OAuthService } from '../oauth/oauth.service'
import { OAuthProvider } from '../oauth/oauthtoken.entity'
import { config } from '@creditkarma/dynamic-config'
import { GustoCompany, GustoUser } from './gusto.resolver'

@Injectable()
export class GustoService {
  constructor(
    private readonly oauthService: OAuthService,
    private readonly httpService: HttpService,
  ) {}

  async currentUser(userId: ModelId): Promise<GustoUser> {
    const oauthToken = await this.oauthService.getOrRefreshSavedAccessToken(
      userId,
      OAuthProvider.GUSTO,
    )
    // TODO can prob use a decorator/guard for this
    if (!oauthToken) {
      throw new ForbiddenException(OAuthProvider.GUSTO)
    }
    return await this.get('v1/me', oauthToken.accessToken!)
  }

  async companyById(userId: ModelId, id: number): Promise<GustoCompany> {
    const oauthToken = await this.oauthService.getOrRefreshSavedAccessToken(
      userId,
      OAuthProvider.GUSTO,
    )
    // TODO can prob use a decorator/guard for this
    if (!oauthToken) {
      throw new ForbiddenException(OAuthProvider.GUSTO)
    }
    return await this.get(`v1/companies/${id}`, oauthToken.accessToken!)
  }

  // TODO: below code should prob go in some common place
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
