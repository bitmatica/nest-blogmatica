import { Controller, Get, HttpService, Param, Request, UseGuards } from '@nestjs/common'
import { config } from '@creditkarma/dynamic-config'
import { RestJwtAuthGuard } from '../authentication/guards/jwt-auth.guard'
import { getConnection } from 'typeorm'
import { OAuthProvider, OAuthToken } from '../oauth/oauthtoken.entity'

@Controller('gusto')
export class GustoController {
  constructor(private httpService: HttpService) {}

  @Get()
  async root() {
    return `<html><ul>
<li><a href='/gusto/v1/me'>GET /v1/me</a></li>
<li><a href='/gusto/v1/employees/:employee_id'>GET /v1/employees/:employee_id</a></li>
</ul>
</html>`
  }

  @Get('v1')
  async getRoutes() {
    return {
      routes: [
        {
          action: 'GET',
          path: 'v1/me',
        },
        {
          action: 'GET',
          path: 'v1/companies',
        },
        {
          action: 'GET',
          path: 'v1/employees/:employee_id',
        },
      ],
    }
  }

  // @UseGuards(RestJwtAuthGuard)
  // @Get('*')
  // async proxy(@Request() req: Express.Request, @Param() path: string) {
  //   return this.get(path)
  // }

  @UseGuards(RestJwtAuthGuard)
  @Get('v1/me')
  async user(@Request() req: Express.Request) {
    return this.get('v1/me', req.user!.id)
  }

  // @Get('v1/companies')
  // async companies() {
  //   return this.get(`v1/companies`)
  // }
  //
  // @Get('v1/employees/:employee_id')
  // async employeeById(@Param('employee_id') employeeId: string) {
  //   return this.get(`v1/employees/${employeeId}`)
  // }
  //
  // @Get('v1/companies/:company_id')
  // async companyById(@Param('company_id') companyId: string) {
  //   return this.get(`v1/companies/${companyId}`)
  // }
  //
  // @Get('v1/companies/:company_id/employees')
  // async getEmployees(@Param('company_id') companyId: string) {
  //   return this.get(`v1/companies/${companyId}/employees`)
  // }
  //
  // @Get('v1/companies/:company_id/employees/create')
  // async createEmployee(@Param('company_id') companyId: string) {
  //   return this.post(`v1/companies/${companyId}/employees`)
  // }

  async getToken(userId: string) {
    const repo = getConnection().getRepository(OAuthToken)
    const tokenInfo = (await repo.findOne({ userId, provider: OAuthProvider.GUSTO }))!
    return tokenInfo.accessToken
    // return '922f5735db0aebe435ddc1c5059f2e40d8f1ef7ebeef2585b277c3d66d460f5b'
  }

  async buildUri(path: string) {
    const conf = await config().get<any>('oauth')
    return `${conf.gusto.baseApiUri}${path}`
  }

  async get(path: string, userId: string) {
    const token = await this.getToken(userId)
    const url = await this.buildUri(path)
    return (await this.getWithAuthentication(url, token!)).data
  }

  async post(path: string, userId: string) {
    const token = await this.getToken(userId)
    const url = await this.buildUri(path)
    return (await this.postWithAuthentication(url, token!)).data
  }

  async getWithAuthentication(url: string, token: string) {
    return this.httpService.get(url, { headers: this.requestHeaders(token) }).toPromise()
  }

  async postWithAuthentication(url: string, token: string) {
    return this.httpService
      .post(
        url,
        {
          first_name: 'Kasey',
          last_name: 'Moffat',
          email: 'kasey@initech.biz',
        },
        {
          headers: this.requestHeaders(token),
        },
      )
      .toPromise()
  }

  requestHeaders(token: string) {
    return {
      Authorization: `Bearer ${token}`,
    }
  }
}
