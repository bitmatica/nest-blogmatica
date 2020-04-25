import { Field, ObjectType } from '@nestjs/graphql'
import { Column, Entity, OneToMany } from 'typeorm'
import { BaseModel } from '../core/model'
import { Post } from '../posts/post.entity'

@ObjectType()
@Entity()
export class User extends BaseModel {
  @Field()
  @Column()
  email: string

  @Field(type => [ Post ])
  @OneToMany(type => Post, post => post.author, { lazy: true })
  posts: Promise<Array<Post>>
}
