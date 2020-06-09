import { Args, Field, InputType, Mutation, ObjectType, Query, Resolver } from '@nestjs/graphql'
import { ModelMutationResponse } from '../core/resolvers/types'
import { PlaidItem } from './plaidItem.entity'
import { PlaidService } from './plaid.service'
import { CurrentUser } from '../decorators/currentUser'
import { User } from '../users/user.entity'
import { UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '../authentication/guards/jwt-auth.guard'

@InputType()
export class PlaidExchangePublicTokenArgs {
  @Field()
  publicToken: string
}

@ObjectType()
export class PlaidExchangePublicTokenResponse extends ModelMutationResponse<PlaidItem> {
  @Field()
  itemId?: string
}

@ObjectType()
export class PlaidBalance {
  @Field({ nullable: true })
  available?: number
  @Field({ nullable: true })
  current?: number
  @Field({ nullable: true })
  limit?: number
  @Field({ nullable: true })
  iso_currency_code?: string
  @Field({ nullable: true })
  unofficial_currency_code?: string
}

@ObjectType()
export class PlaidAccount {
  @Field()
  account_id: string
  @Field()
  balances: PlaidBalance
  @Field({ nullable: true })
  mask?: string
  @Field({ nullable: true })
  name?: string
  @Field({ nullable: true })
  official_name?: string
  @Field({ nullable: true })
  subtype?: string
  @Field({ nullable: true })
  type?: string
  @Field({ nullable: true })
  verification_status?:
    | 'pending_automatic_verification'
    | 'pending_manual_verification'
    | 'manually_verified'
    | 'automatically_verified'
}

@InputType()
export class PlaidGetAccountsArgs {
  @Field()
  itemId: string
}

@ObjectType()
export class PlaidGetAccountsResponse {
  @Field(type => [PlaidAccount])
  accounts: Array<PlaidAccount>
}

@Resolver('Plaid')
export class PlaidResolver {
  constructor(private readonly plaidService: PlaidService) {}

  @UseGuards(JwtAuthGuard)
  @Mutation(returns => PlaidExchangePublicTokenResponse)
  async exchangePublicToken(
    @Args('input', { type: () => PlaidExchangePublicTokenArgs })
    input: PlaidExchangePublicTokenArgs,
    @CurrentUser() user: User,
  ) {
    try {
      const itemId = await this.plaidService.exchangePublicToken(user.id, input.publicToken)
      return {
        success: true,
        message: 'Public token exchange successful!',
        itemId,
      }
    } catch (err) {
      console.error(err)
      return {
        success: false,
        message: 'Public token exchange failed!',
      }
    }
  }

  @Query(returns => PlaidGetAccountsResponse)
  async getPlaidAccounts(
    @Args('input', { type: () => PlaidGetAccountsArgs }) input: PlaidGetAccountsArgs,
    @CurrentUser() user: User,
  ) {
    const accounts = await this.plaidService.getPlaidAccounts(user.id, input.itemId)
    return {
      accounts,
    }
  }
}
