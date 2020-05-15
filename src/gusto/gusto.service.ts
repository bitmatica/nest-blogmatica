import { ForbiddenException, HttpService, Injectable } from '@nestjs/common'
import { ModelId } from '../core/model'
import { OAuthService } from '../oauth/oauth.service'
import { OAuthProvider } from '../oauth/oauthtoken.entity'
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
    // TODO maybe the token has expired (edge case, if expiration check result has changed or token.created_at+token.expires_in is inaccurate).
    //  If receive 401, refresh token and try again once.
    //  If that fails, either refresh token is no longer valid or something is wrong with authorization server.
    //  Maybe throw a forbidden to initiate another oauth flow.
    return (await this.getWithBearerToken(url, token!)).data
  }

  async buildUri(path: string, provider: OAuthProvider) {
    const conf = this.oauthService.config(provider)
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
