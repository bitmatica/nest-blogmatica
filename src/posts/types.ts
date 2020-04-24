import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { Post } from './post.entity'

@InputType()
export class PostInput implements Omit<Post, 'id'> {
  @Field()
  body: string

  @Field()
  title: string
}

@ObjectType()
export class PostMutationResponse {
  @Field()
  success: boolean

  @Field()
  message: string

  @Field({ nullable: true })
  post?: Post
}

@ObjectType()
export class DeletionResponse {
  @Field()
  success: boolean

  @Field()
  message: string
}
