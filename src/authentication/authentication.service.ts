import { Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { User } from '../users/user.entity'
import { UsersService } from '../users/users.service'


@Injectable()
export class AuthenticationService {
  REFRESH_TOKEN = "refresh token"

  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  async validateUser(username: string, password: string): Promise<User | undefined> {
    const user = await this.usersService.getByEmail(username)
    if (user) {
      const correctPassword = await user.checkPassword(password)
      return correctPassword ? user : undefined
    }
  }

  generateRefreshToken() {
    return this.REFRESH_TOKEN
  }

  isValidRefreshToken(token: string) {
    return token === this.REFRESH_TOKEN
  }

  getJwt(user: User): string {
    const payload = { username: user.email, sub: user.id }
    return this.jwtService.sign(payload)
  }
}
