import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { BaseModel } from '../common/model';

@ObjectType()
@Entity()
export class Post extends BaseModel {
  @Field()
  @Column()
  title: string

  @Field()
  @Column()
  body: string
}
