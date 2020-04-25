import { Resolver } from '@nestjs/graphql'
import { BaseResolver } from '../common/resolver/model'
import { User } from './user.entity'

@Resolver(of => User)
export class UsersResolver extends BaseResolver(User) {}
