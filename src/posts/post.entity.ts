import { Field, ObjectType } from '@nestjs/graphql'
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm'
import { Comment } from '../comments/comment.entity'
import { ActionScope, Can, RecordScope, UserScope } from '../core/can'
import { BaseModel, ModelId } from '../core/model'
import { User } from '../users/user.entity'

@ObjectType()
@Entity()
export class Post extends BaseModel {
  @Field()
  @Column()
  title: string

  @Field()
  @Column()
  body: string

  @Field(type => User)
  @ManyToOne(type => User, { nullable: false, lazy: true })
  author: Promise<User>

  @Column()
  authorId: ModelId

  @Field(type => [Comment])
  @OneToMany(
    type => Comment,
    comment => comment.post,
    { lazy: true, cascade: true },
  )
  comments: Promise<Array<Comment>>
}

Can.register(Post)
  .do(ActionScope.Read)
  .do(ActionScope.All, {
    as: UserScope.Authenticated,
    to: RecordScope.Owned('authorId'),
  })
