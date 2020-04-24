import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class DeletionResponse {
  @Field()
  success: boolean

  @Field()
  message: string
}

@ObjectType()
export class MutationResponse {
  @Field()
  success: boolean

  @Field()
  message: string
}
