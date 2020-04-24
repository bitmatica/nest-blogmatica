import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class DeletionResponse {
  @Field()
  success: boolean

  @Field()
  message: string
}

@ObjectType()
export abstract class MutationResponse {
  @Field()
  success: boolean

  @Field()
  message: string
}
