import { Field, HideField, ObjectType } from '@nestjs/graphql'
import * as bcrypt from 'bcrypt'
import { Column, Entity, OneToMany } from 'typeorm'
import { Comment } from '../comments/comment.entity'
import { ActionScope, Can, RecordScope, UserScope } from '../core/can'
import { BaseModel } from '../core/model'
import { Post } from '../posts/post.entity'

@ObjectType()
@Entity()
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

  // Placeholder until we have a real solution
  roles: Array<string> = []

  async setPassword(password: string): Promise<void> {
    const salt = await bcrypt.genSalt(10)
    this.passwordHash = await bcrypt.hash(password, salt)
  }

  async checkPassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.passwordHash)
  }
}

Can.register(User)
  .do(ActionScope.Read, { as: UserScope.Authenticated })
  .do(Can.everything(), { as: UserScope.Authenticated, to: RecordScope.All })
