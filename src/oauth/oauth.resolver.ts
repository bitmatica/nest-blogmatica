import {
  Args,
  Field,
  InputType,
  Mutation,
  ObjectType,
  registerEnumType,
  Resolver,
} from '@nestjs/graphql'
import { OAuthProvider } from './oauthtoken.entity'
import { OAuthService } from './oauth.service'
import { CurrentUser } from '../decorators/currentUser'
import { User } from '../users/user.entity'
import { UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '../authentication/guards/jwt-auth.guard'

@InputType()
export class GenerateAuthorizationUriInput {
  @Field(type => OAuthProvider)
  provider: OAuthProvider
}

@ObjectType()
export class GenerateAuthorizationUriResponse {
  @Field()
  success: boolean

  @Field()
  message: string

  @Field({ nullable: true })
  uri?: string
}

registerEnumType(OAuthProvider, {
  name: 'OAuthProvider',
})

@Resolver()
export class OAuthResolver {
  constructor(private readonly oauthService: OAuthService) {}

  // An HTTP request with 302 redirect seems more standard, but providing this since it's easier to deal with GQL in FE.
  // Not sure if doing a client-side redirect with GQL response is any less secure than server redirect.
  @UseGuards(JwtAuthGuard)
  @Mutation(returns => GenerateAuthorizationUriResponse)
  async generateAuthorizationUri(
    @Args('input') input: GenerateAuthorizationUriInput,
    @CurrentUser() user: User,
  ) {
    try {
      const uri = await this.oauthService.generateAuthorizationUri(input.provider, user.id)
      return {
        success: true,
        message: 'Successfully generated authorization uri',
        uri,
      }
    } catch (err) {
      return {
        success: false,
        message: 'Failed to generate authorization uri',
      }
    }
  }
}
