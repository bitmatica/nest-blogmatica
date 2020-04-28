import { Resolver } from '@nestjs/graphql'
import { BaseModelResolver } from '../core/resolvers/model'
import { User } from './user.entity'

@Resolver(() => User)
export class UsersResolver extends BaseModelResolver(User) {}
