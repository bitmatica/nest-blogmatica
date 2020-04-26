import { Resolver } from '@nestjs/graphql'
import { BaseModelResolver } from '../core/resolvers/model'
import { User } from './user.entity'

@Resolver()
export class UsersResolver extends BaseModelResolver(User) {}
