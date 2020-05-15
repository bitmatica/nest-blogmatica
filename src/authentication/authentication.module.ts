import { Module, Res } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { AuthenticationService } from './authentication.service'
import { jwtServiceOptions } from './constants'
import { JwtStrategy } from './strategies/jwt.strategy'
import { UsersService } from '../users/users.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { User } from '../users/user.entity'
import { response } from 'express'

@Module({
  imports: [
    PassportModule,
    JwtModule.register(jwtServiceOptions),
    TypeOrmModule.forFeature([User]),
  ],
  providers: [AuthenticationService, JwtStrategy, UsersService],
  exports: [AuthenticationService],
})
export class AuthenticationModule {}
