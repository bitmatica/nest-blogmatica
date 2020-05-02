import { UseGuards } from '@nestjs/common'
import {
  Args,
  Context,
  Field,
  InputType,
  Mutation,
  ObjectType,
  Query,
  Resolver,
} from '@nestjs/graphql'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import {
  AuthenticationService,
  clearTokenCookie,
  setTokenCookie,
} from '../authentication/authentication.service'
import { JwtAuthGuard } from '../authentication/guards/jwt-auth.guard'
import { IContext } from '../core/context'
import { Create, CreateModelMutation } from '../core/resolvers/actions'
import { BaseModelResolver } from '../core/resolvers/model'
import { MutationResponse } from '../core/resolvers/types'
import { CurrentUser } from '../decorators/currentUser'
import { User } from './user.entity'

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
  @Field({ nullable: true, name: 'user' })
  model?: User

  @Field({ nullable: true })
  token?: string
}

@Resolver(() => User)
export class UsersResolver extends BaseModelResolver(User, {
  without: [Create],
}) {
  @InjectRepository(User)
  protected repo: Repository<User>

  constructor(private readonly authenticationService: AuthenticationService) {
    super()
  }

  @CreateModelMutation(User)
  async create(
    @Args('input', { type: () => CreateUserInput }) input: CreateUserInput,
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

  @Mutation(returns => UserLoginResponse)
  async login(
    @Args('input', { type: () => UserLoginArgs }) input: UserLoginArgs,
    @Context() context: IContext,
  ) {
    try {
      const user = await this.authenticationService.validateUser(
        input.email,
        input.password,
      )
      const token = await this.authenticationService.login(user!)

      setTokenCookie(context.res, token)

      return {
        success: true,
        message: 'Login successful!',
        model: user,
        token: token,
      }
    } catch (err) {
      return {
        success: false,
        message: 'Login failed',
      }
    }
  }

  @Mutation(returns => MutationResponse)
  async logout(@Context() context: IContext) {
    try {
      clearTokenCookie(context.res)
      return {
        success: true,
        message: 'Logout successful!',
      }
    } catch (err) {
      return {
        success: false,
        message: 'Logout failed',
      }
    }
  }

  @UseGuards(JwtAuthGuard)
  @Query(returns => User)
  async whoAmI(@CurrentUser() user: User) {
    return user
  }
}
