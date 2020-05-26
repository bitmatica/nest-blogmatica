import { UseGuards } from '@nestjs/common'
import { Args, Context, Field, Info, ObjectType, Query, Resolver } from '@nestjs/graphql'
import { GraphQLInputObjectType, GraphQLObjectType, GraphQLResolveInfo } from 'graphql'
import { JwtAuthGuard } from '../../authentication/guards/jwt-auth.guard'
import { IContext } from '../context'

@ObjectType()
class ObjectProperty {
  @Field()
  name: string

  @Field()
  type: string
}

@Resolver()
export class AdminResolver {
  @UseGuards(JwtAuthGuard)
  @Query(returns => [ObjectProperty], { nullable: true })
  getObjectProperties(
    @Args('objectName') objectName: string,
    @Context() context: IContext,
    @Info() info: GraphQLResolveInfo,
  ) {
    const type = info.schema.getType(objectName)
    if (type instanceof GraphQLObjectType || type instanceof GraphQLInputObjectType) {
      const fields = type.getFields()
      return Object.keys(fields).map(key => ({
        name: key,
        type: fields[key].type,
      }))
    }
  }
}
