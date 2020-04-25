import { Field, ObjectType } from '@nestjs/graphql';
import { Column, Entity, OneToMany } from 'typeorm';
import { BaseModel } from '../common/model';
import { Post } from '../posts/post.entity';

@ObjectType()
@Entity()
export class User extends BaseModel {
  @Field()
  @Column()
  email: string;

  @OneToMany(type => Post, post => post.author)
  posts: Promise<Array<Post>>
}
