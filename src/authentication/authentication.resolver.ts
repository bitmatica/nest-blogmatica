import { Args, Context, Field, InputType, Mutation, ObjectType, Resolver } from '@nestjs/graphql'
import { User } from 'src/users/user.entity'
import { Repository } from 'typeorm'
import { AuthenticationService } from '../authentication/authentication.service'
import { REFRESH_TOKEN_KEY } from '../authentication/constants'
import { IContext } from '../core/context'
import { ModelMutationResponse, MutationResponse } from '../core/resolvers/types'
import { getOrThrow } from '../core/utils'
import { CurrentUser } from '../decorators/currentUser'

@InputType()
export class UserLoginArgs {
  @Field()
  email: string

  @Field()
  password: string
}

@ObjectType()
export class UserLoginResponse extends ModelMutationResponse<User> {
  @Field({ nullable: true, name: 'user' })
  model?: User

  @Field({ nullable: true })
  token?: string
}

@Resolver()
export class AuthenticationResolver {
  constructor(
    private readonly repo: Repository<User>,
    private readonly authenticationService: AuthenticationService,
  ) {}

  @Mutation(returns => UserLoginResponse)
  async login(
    @Args('input', { type: () => UserLoginArgs }) input: UserLoginArgs,
    @Context() context: IContext,
  ) {
    try {
      const user = getOrThrow(
        await this.authenticationService.validateUser(input.email, input.password),
        'Invalid username or password',
      )

      const refreshToken = await this.authenticationService.generateRefreshToken(user)
      context.res.cookie(REFRESH_TOKEN_KEY, refreshToken, { httpOnly: true })

      return {
        success: true,
        message: 'Login successful!',
        model: user,
        token: this.authenticationService.getAccessToken(user),
      }
    } catch (err) {
      return {
        success: false,
        message: 'Login failed',
      }
    }
  }

  @Mutation(returns => MutationResponse)
  async logout(@Context() context: IContext): Promise<MutationResponse> {
    context.res.clearCookie(REFRESH_TOKEN_KEY)
    try {
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

  @Mutation(returns => ModelMutationResponse)
  async refreshToken(@CurrentUser() user: User, @Context() context: IContext) {
    const token = context.req.cookies[REFRESH_TOKEN_KEY]

    if (!(await this.authenticationService.isValidRefreshToken(user, token))) {
      return {
        success: false,
        message: 'Token refresh failed',
      }
    }

    try {
      return {
        token: this.authenticationService.getAccessToken(user),
        success: true,
      }
    } catch {
      return {
        success: false,
        message: 'Token refresh failed',
      }
    }
  }
}
