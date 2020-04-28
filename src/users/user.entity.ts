import { Field, ObjectType } from '@nestjs/graphql'
import { Column, Entity, OneToMany } from 'typeorm'
import { Comment } from '../comments/comment.entity'
import { ActionScope, Can, RecordScope, UserScope } from '../core/can'
import { BaseModel } from '../core/model'
import { Post } from '../posts/post.entity'

@ObjectType()
@Entity()
@Can.register({
  ownershipField: 'id',
  permissions: [
    Can.do(ActionScope.Read).as(UserScope.Authenticated).to(RecordScope.Owned),
    Can.do(Can.everything()).as(UserScope.Authenticated).to(RecordScope.All).withRole('admin'),
  ],
})
export class User extends BaseModel {
  @Field()
  @Column()
  email: string

  @Field(type => [ Post ])
  @OneToMany(type => Post, post => post.author, { lazy: true })
  posts: Promise<Array<Post>>

  @Field(type => [ Comment ])
  @OneToMany(type => Comment, comment => comment.author, { lazy: true })
  comments: Promise<Array<Comment>>
}
