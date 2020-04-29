import { Args, Context, Field, InputType, Mutation, ObjectType, Query, Resolver } from '@nestjs/graphql';
import { BaseModelResolver } from '../core/resolvers/model';
import { User } from './user.entity';
import { MutationResponse } from '../core/resolvers/types';
import { clearTokenCookie, generateTokenForUserId, setTokenCookie } from './authentication';
import { Create, CreateModelMutation } from '../core/resolvers/actions';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IContext } from '../common/context';
import { CurrentUser } from '../decorators/currentUser';

@InputType()
export class CreateUserInput {
  @Field()
  email: string

  @Field()
  password: string
}

@InputType()
export class UserLoginArgs {
  @Field()
  email: string

  @Field()
  password: string
}

@ObjectType()
export class UserLoginResponse extends MutationResponse<User> {
  @Field({nullable: true, name: 'user'})
  model?: User

  @Field({nullable: true})
  token?: string
}

@Resolver(() => User)
export class UsersResolver extends BaseModelResolver(User, { without: [ Create ] }) {
  @InjectRepository(User)
  protected repo: Repository<User>

  @CreateModelMutation(User)
  async create(
    @Args('input', { type: () => CreateUserInput }) input: CreateUserInput
  ) {
    try {
      const model = new User()
      model.email = input.email
      await model.setPassword(input.password)
      const saved = await this.repo.save(model)
      return {
        success: true,
        message: `User created.`,
        model: saved,
      }
    } catch (err) {
      return {
        success: false,
        message: err.message,
      }
    }
  }

  @Mutation(returns => UserLoginResponse!)
  async login(
    @Args('input', { type: () => UserLoginArgs }) input: UserLoginArgs,
    @Context() context: IContext
  ) {
    try {
      const user: User | undefined = await this.repo.findOne({ email: input.email })
      if (!user) {
        return {
          success: false,
          message: 'User does not exist'
        }
      }
      const correctPassword = await user.checkPassword(input.password)
      if (!correctPassword) {
        return {
          success: false,
          message: 'Incorrect password'
        }
      }
      const token = await generateTokenForUserId(user.id)
      setTokenCookie(context.res, token)
      return {
        success: true,
        message: 'Login successful!',
        model: user,
        token: token
      }
    } catch(err) {
      return {
        success: false,
        message: 'Login failed'
      }
    }
  }

  @Mutation(returns => MutationResponse!)
  async logout(
    @Context() context: IContext
  ) {
    try {
      clearTokenCookie(context.res)
      return {
        success: true,
        message: 'Logout successful!'
      }
    } catch(err) {
      return {
        success: false,
        message: 'Logout failed'
      }
    }
  }

  @Query(returns => User, { nullable: true })
  async whoAmI(
    @CurrentUser() user: User
  ) {
    return user
  }
}
