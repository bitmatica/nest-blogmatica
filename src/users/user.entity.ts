import { Field, HideField, ObjectType } from '@nestjs/graphql';
import { Column, Entity, OneToMany } from 'typeorm'
import { Comment } from '../comments/comment.entity'
import { ActionScope, Can, RecordScope, UserScope } from '../core/can'
import { BaseModel } from '../core/model'
import { Post } from '../posts/post.entity'
import * as bcrypt from 'bcrypt'

@ObjectType()
@Entity()
@Can.register(
  Can.do(ActionScope.Read).as(UserScope.Authenticated),
  Can.do(Can.everything()).as(UserScope.Authenticated).to(RecordScope.All).withRole('admin'),
)
export class User extends BaseModel {
  @Field()
  @Column({ unique: true })
  email: string

  @HideField()
  @Column()
  passwordHash: string

  @Field(type => [ Post ])
  @OneToMany(type => Post, post => post.author, { lazy: true })
  posts: Promise<Array<Post>>

  @Field(type => [ Comment ])
  @OneToMany(type => Comment, comment => comment.author, { lazy: true })
  comments: Promise<Array<Comment>>

  async setPassword(password: string): Promise<void> {
    const salt = await bcrypt.genSalt(10)
    this.passwordHash = await bcrypt.hash(password, salt)
  }

  async checkPassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.passwordHash)
  }
}
