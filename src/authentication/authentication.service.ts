import { Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { randomBytes } from 'crypto'
import { Repository } from 'typeorm'
import { User } from '../users/user.entity'
import { UsersService } from '../users/users.service'
import { AuthSession } from './authSession.entity'

@Injectable()
export class AuthenticationService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
    private readonly sessionRepo: Repository<AuthSession>,
  ) {}

  async validateUser(username: string, password: string): Promise<User | undefined> {
    const user = await this.usersService.getByEmail(username)
    if (user) {
      const correctPassword = await user.checkPassword(password)
      return correctPassword ? user : undefined
    }
  }

  async generateRefreshToken(user: User): Promise<string | undefined> {
    try {
      const session = new AuthSession()
      session.refreshToken = this.generateNonce()
      session.userId = user.id
      await this.sessionRepo.create(session)

      return session.refreshToken
    } catch {}
  }

  private generateNonce() {
    return randomBytes(48).toString('base64')
  }

  async isValidRefreshToken(user: User, token: string): Promise<boolean> {
    const session = await this.sessionRepo.findOne({
      refreshToken: token,
      userId: user.id,
    })
    // TODO: Expire refresh tokens after a certain amount of time
    return Boolean(session)
  }

  getAccessToken(user: User): string {
    const payload = { username: user.email, sub: user.id }
    return this.jwtService.sign(payload)
  }
}
