import { Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { User } from '../users/user.entity'
import { UsersService } from '../users/users.service'

@Injectable()
export class AuthenticationService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService
  ) {}

  async validateUser(username: string, password: string): Promise<User | undefined> {
    const user = await this.usersService.findOne(username)
    if (user) {
      const correctPassword = await user.checkPassword(password)
      return correctPassword ? user : undefined
    }
    return undefined
  }

  async login(user: User): Promise<string> {
    const payload = { username: user.email, sub: user.id }
    return this.jwtService.sign(payload)
  }
}
