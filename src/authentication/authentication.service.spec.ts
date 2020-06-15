import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { Test, TestingModule } from '@nestjs/testing'
import { AuthenticationService } from './authentication.service'
import { jwtConstants } from './constants'
import { AppModule } from '../app.module'

describe('AuthService', () => {
  let service: AuthenticationService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        PassportModule,
        AppModule,
        JwtModule.register({
          secret: jwtConstants.secret,
          signOptions: { expiresIn: '60m' },
        }),
      ],
    }).compile()

    service = module.get<AuthenticationService>(AuthenticationService)
  })

  it('should be defined', async () => {
    jest.spyOn(service, 'deleteSession').mockImplementation(() => Promise.resolve())
    expect(service).toBeDefined()
    expect(await service.deleteSession("token")).toBe('logged in')
  })
})
