import { Field, HideField, ObjectType } from '@nestjs/graphql';
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

  @HideField()
  @ManyToOne(type => User, { nullable: false })
  author: User

  @Column()
  authorId: string
}
