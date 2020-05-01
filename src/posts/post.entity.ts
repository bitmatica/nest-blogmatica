import { Field, ObjectType } from '@nestjs/graphql'
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm'
import { Comment } from '../comments/comment.entity'
import { ActionScope, Can, RecordScope, UserScope } from '../core/can'
import { BaseModel } from '../core/model'
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
  authorId: string

  @Field(type => [ Comment ])
  @OneToMany(type => Comment, comment => comment.post, { lazy: true })
  comments: Promise<Array<Comment>>
}

Can.register(Post)
  // .do(ActionScope.Read, { as: UserScope.Where((ctx) => ctx.user?.id === 'af58075c-7f18-4312-90fb-a78ef1bb629a'), to: RecordScope.Where('title', 'New title') })
  .do(ActionScope.Read, { as: UserScope.WithRole('admin'), to: RecordScope.Where('title', 'New title') })
  // .do(ActionScope.Create, { as: UserScope.Authenticated, to: RecordScope.Owned('authorId') })
