import { Resolver } from '@nestjs/graphql'
import { BaseModelResolver } from '../common/resolver/model'
import { User } from './user.entity'

@Resolver(of => User)
export class UsersResolver extends BaseModelResolver(User) {}
