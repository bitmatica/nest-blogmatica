import { Resolver } from '@nestjs/graphql'
import { of } from 'rxjs'
import { BaseModelResolver } from '../core/resolvers/model'
import { User } from './user.entity'

@Resolver(of => User)
export class UsersResolver extends BaseModelResolver(User) {}
