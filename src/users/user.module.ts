import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { User } from './user.entity'
import { UsersResolver } from './user.resolver'

@Module({
  imports: [ TypeOrmModule.forFeature([ User ]) ],
  providers: [ UsersResolver ],
})
export class UsersModule {}
