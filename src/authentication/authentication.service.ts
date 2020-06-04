import { Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { User } from '../users/user.entity'
import { UsersService } from '../users/users.service'
import { AuthSession } from './authSession.entity'
import { generateNonce, getDate } from '../core/utils'
import { DAYS_AFTER_LOGIN_REFRESH_TOKEN_EXPIRY } from './constants'

@Injectable()
export class AuthenticationService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
    @InjectRepository(AuthSession) private readonly sessionRepo: Repository<AuthSession>,
  ) {}

  async validateUser(username: string, password: string): Promise<User | undefined> {
    const user = await this.usersService.getByEmail(username)
    if (user) {
      const correctPassword = await user.checkPassword(password)
      return correctPassword ? user : undefined
    }
  }

  async createAuthSession(user: User): Promise<string | undefined> {
    try {
      const session = new AuthSession()
      session.refreshToken = this.generateRefreshToken()
      session.expiry = getDate(DAYS_AFTER_LOGIN_REFRESH_TOKEN_EXPIRY)
      session.userId = user.id
      this.sessionRepo.create(session)
      await this.sessionRepo.save(session)
      return session.refreshToken
    } catch {}
  }

  async isValidRefreshToken(user: User, token: string): Promise<boolean> {
    const session = await this.sessionRepo.findOne({
      refreshToken: token,
      userId: user.id,
    })
    if (!session || session.expiry < new Date()) return false
    session.refreshToken = this.generateRefreshToken()
    await this.sessionRepo.save(session)
    return true
  }

  generateRefreshToken() {
    return generateNonce()
  }

  generateAccessToken(user: User): string {
    const payload = { username: user.email, sub: user.id }
    return this.jwtService.sign(payload)
  }

  async getUserByRefreshToken(refreshToken: string): Promise<User | undefined> {
    const session = await this.sessionRepo.findOne({ refreshToken })
    return session?.user
  }

  async deleteSession(userId: string): Promise<void> {
    await this.sessionRepo.delete({ userId })
  }
}
