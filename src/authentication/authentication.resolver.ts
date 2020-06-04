import { Args, Context, Field, InputType, Mutation, ObjectType, Resolver } from '@nestjs/graphql'
import { InjectRepository } from '@nestjs/typeorm'
import { User } from 'src/users/user.entity'
import { Repository } from 'typeorm'
import { IContext } from '../core/context'
import { ModelMutationResponse, MutationResponse } from '../core/resolvers/types'
import { getOrThrow } from '../core/utils'
import { CurrentUser } from '../decorators/currentUser'
import { AuthenticationService } from './authentication.service'
import { REFRESH_TOKEN_KEY } from './constants'

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

@ObjectType()
export class RefreshTokenResponse extends MutationResponse {
  @Field({ nullable: true })
  token?: string
}

@Resolver()
export class AuthenticationResolver {
  constructor(
    @InjectRepository(User) private readonly repo: Repository<User>,
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
      const refreshToken = await this.authenticationService.createAuthSession(user)
      this.setRefreshToken(context, refreshToken)
      return {
        success: true,
        message: 'Login successful!',
        model: user,
        token: this.authenticationService.generateAccessToken(user),
      }
    } catch (err) {
      return {
        success: false,
        message: 'Login failed',
      }
    }
  }

  @Mutation(returns => MutationResponse)
  async logout(
    @Context() context: IContext
  ): Promise<MutationResponse> {
    try {
      const token = this.getRefreshToken(context)
      context.res.clearCookie(REFRESH_TOKEN_KEY)
      if (token) {
        await this.authenticationService.deleteSession(token)
      }
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

  private REFRESH_TOKEN_FAILURE_RESPONSE = {
    success: false,
    message: 'Token refresh failed',
  }

  @Mutation(returns => RefreshTokenResponse)
  async refreshToken(
    @CurrentUser() user: User | undefined,
    @Context() context: IContext,
  ): Promise<RefreshTokenResponse> {
    const refreshToken = this.getRefreshToken(context)
    if (!refreshToken) return this.REFRESH_TOKEN_FAILURE_RESPONSE
    try {
      const session = await this.authenticationService.getSessionFromRefreshToken(refreshToken)
      if (!session) return this.REFRESH_TOKEN_FAILURE_RESPONSE
      const newRefreshToken = await this.authenticationService.replaceRefreshToken(session)
      this.setRefreshToken(context, newRefreshToken)
      const newAccessToken = this.authenticationService.generateAccessToken(await session.user)
      if (!newAccessToken) return this.REFRESH_TOKEN_FAILURE_RESPONSE
      return {
        success: true,
        message: 'Success',
        token: newAccessToken
      }
    } catch {
      return this.REFRESH_TOKEN_FAILURE_RESPONSE
    }
  }

  private getRefreshToken(context: IContext): string | undefined {
    return context.req.cookies[REFRESH_TOKEN_KEY]
  }

  private setRefreshToken(context: IContext, refreshToken?: string): void {
    context.res.cookie(REFRESH_TOKEN_KEY, refreshToken, { httpOnly: true })
  }
}
