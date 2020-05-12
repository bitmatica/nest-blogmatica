import { Args, Field, ObjectType, Query, Resolver } from '@nestjs/graphql'
import { UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '../authentication/guards/jwt-auth.guard'
import { GustoService } from './gusto.service'
import { CurrentUser } from '../decorators/currentUser'
import { User } from '../users/user.entity'

// TODO: try quicktype for generating TS types from sample JSON response
@ObjectType()
export class GustoCompany {
  @Field()
  id: string

  @Field()
  name: string

  @Field()
  trade_name: string

  @Field()
  ein: string

  @Field()
  entity_type: string

  @Field()
  company_status: string

  @Field(type => [GustoCompanyLocation])
  locations: [GustoCompanyLocation]
}

@ObjectType()
export class GustoCompanyLocation {
  @Field()
  id: number

  @Field()
  version: string

  @Field()
  company_id: number

  @Field()
  phone_number: number

  @Field()
  street_1: string

  @Field()
  street_2: string

  @Field()
  city: string

  @Field()
  state: string

  @Field()
  zip: number

  @Field()
  country: string
}

@ObjectType()
export class GustoRole {
  @Field(type => [GustoCompany])
  companies: [GustoCompany]
}

@ObjectType()
export class GustoRoles {
  @Field()
  payroll_admin: GustoRole
}

@ObjectType()
export class GustoUser {
  @Field()
  email: string

  @Field(type => GustoRoles)
  roles: GustoRoles
}

@Resolver()
export class GustoResolver {
  constructor(private readonly gustoService: GustoService) {}
  @UseGuards(JwtAuthGuard)
  @Query(returns => GustoUser)
  currentUser(@CurrentUser() user: User) {
    return this.gustoService.currentUser(user.id)
  }

  @UseGuards(JwtAuthGuard)
  @Query(returns => GustoCompany)
  companyById(@CurrentUser() user: User, @Args('id') id: number) {
    return this.gustoService.companyById(user.id, id)
  }
}
