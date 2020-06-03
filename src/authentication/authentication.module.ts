import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { TypeOrmModule } from '@nestjs/typeorm'
import { User } from 'src/users/user.entity'
import { UsersService } from '../users/users.service'
import { AuthenticationResolver } from './authentication.resolver'
import { AuthenticationService } from './authentication.service'
import { AuthSession } from './authSession.entity'
import { jwtServiceOptions } from './constants'
import { JwtStrategy } from './strategies/jwt.strategy'

@Module({
  imports: [
    PassportModule,
    JwtModule.register(jwtServiceOptions),
    TypeOrmModule.forFeature([User, AuthSession]),
  ],
  providers: [AuthenticationService, AuthenticationResolver, JwtStrategy, UsersService],
  exports: [AuthenticationService],
})
export class AuthenticationModule {}
