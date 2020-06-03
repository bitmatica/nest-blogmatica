import { UseGuards } from '@nestjs/common'
import { Args, Field, InputType, Query, ResolveField, Resolver } from '@nestjs/graphql'
import md5 from 'md5'
import { Repository } from 'typeorm'
import { JwtAuthGuard } from '../authentication/guards/jwt-auth.guard'
import { Create } from '../core/resolvers/actions'
import { BaseModelResolver } from '../core/resolvers/model'
import { CurrentUser } from '../decorators/currentUser'
import { OAuthService } from '../oauth/oauth.service'
import { OAuthProvider } from '../oauth/oauthtoken.entity'
import { User } from './user.entity'

@InputType()
export class CreateUserInput {
  @Field()
  email: string

  @Field()
  password: string
}

@Resolver(() => User)
export class UsersResolver extends BaseModelResolver(User, {
  without: { Create },
}) {
  constructor(
    private readonly repo: Repository<User>,
    private readonly oauthService: OAuthService,
  ) {
    super()
  }

  @Create.Resolver(User)
  async create(@Args('input', { type: () => CreateUserInput }) input: CreateUserInput) {
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

  @Query(returns => User, { nullable: true })
  async whoAmI(@CurrentUser() user: User) {
    return user
  }

  @UseGuards(JwtAuthGuard)
  @ResolveField(returns => Boolean)
  async gustoAccess(@CurrentUser() user: User): Promise<boolean> {
    return Boolean(
      await this.oauthService.getOrRefreshSavedAccessToken(user.id, OAuthProvider.GUSTO),
    )
  }

  @ResolveField()
  profileImageUrl(user: User): string {
    const hash = md5(user.email.trim().toLowerCase())
    return `https://www.gravatar.com/avatar/${hash}?d=retro`
  }
}
