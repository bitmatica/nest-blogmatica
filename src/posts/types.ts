import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { MutationResponse } from '../common/types';
import { Post } from './post.entity'

@InputType()
export class PostInput implements Omit<Post, 'id'> {
  @Field()
  body: string

  @Field()
  title: string
}

@ObjectType()
export class PostMutationResponse extends MutationResponse {
  @Field({ nullable: true })
  post?: Post
}
