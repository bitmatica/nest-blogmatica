import { Field, ObjectType } from '@nestjs/graphql';
import { Column, Entity, ManyToOne } from 'typeorm';
import { BaseModel } from '../common/model';
import { User } from '../users/user.entity';

@ObjectType()
@Entity()
export class Post extends BaseModel {
  @Field()
  @Column()
  title: string;

  @Field()
  @Column()
  body: string;

  @Field(type => User)
  @ManyToOne(type => User, { nullable: false, lazy: true })
  author: Promise<User>;

  @Column()
  authorId: string;


}
