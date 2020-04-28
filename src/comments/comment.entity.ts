import { Field, ObjectType } from '@nestjs/graphql'
import { Column, Entity, ManyToOne } from 'typeorm'
import { ActionScope, Can, RecordScope, UserScope } from '../core/can'
import { BaseModel } from '../core/model'
import { Post } from '../posts/post.entity'
import { User } from '../users/user.entity'

@ObjectType()
@Entity()
@Can.register({
  ownershipField: 'authorId',
  permissions: [
    Can.do(ActionScope.Create).as(UserScope.Authenticated),
    Can.do(Can.everything()).as(UserScope.Authenticated).to(RecordScope.Owned),
    Can.do(Can.everything()).as(UserScope.Authenticated).withRole('admin'),
  ],
})
export class Comment extends BaseModel {
  @Field()
  @Column()
  body: string

  @Field(type => User)
  @ManyToOne(type => User, { nullable: false, lazy: true })
  author: Promise<User>

  @Column()
  authorId: string

  @Field(type => Post)
  @ManyToOne(type => Post, post => post.comments, { nullable: false, lazy: true })
  post: Promise<Post>

  @Column()
  postId: string
}