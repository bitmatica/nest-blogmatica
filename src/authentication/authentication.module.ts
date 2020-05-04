import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { AuthenticationService } from './authentication.service'
import { jwtConstants } from './constants'
import { JwtStrategy } from './strategies/jwt.strategy'
import { UsersService } from '../users/users.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { User } from '../users/user.entity'

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '60m' },
    }),
    TypeOrmModule.forFeature([User]),
  ],
  providers: [AuthenticationService, JwtStrategy, UsersService],
  exports: [AuthenticationService],
})
export class AuthenticationModule {}
