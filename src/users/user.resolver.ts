import { Resolver } from '@nestjs/graphql';
import { BaseResolver } from '../common/resolver';
import { User } from './user.entity';


@Resolver(of => User)
export class UsersResolver extends BaseResolver(User) {}
