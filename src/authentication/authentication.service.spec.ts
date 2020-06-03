import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { Test, TestingModule } from '@nestjs/testing'
import { UsersModule } from '../users/users.module'
import { AuthenticationService } from './authentication.service'
import { jwtConstants } from './constants'
import { JwtStrategy } from './strategies/jwt.strategy'
import { AppModule } from '../app.module'
import { User } from '../users/user.entity'

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
    jest.spyOn(service, 'login').mockImplementation(() => Promise.resolve('logged in'))
    expect(service).toBeDefined()
    expect(await service.login(new User())).toBe('logged in')
  })
})
