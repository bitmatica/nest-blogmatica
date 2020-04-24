import { Field, ObjectType } from '@nestjs/graphql';
import { Column, Entity } from 'typeorm';
import { BaseModel } from '../common/model';

@ObjectType()
@Entity()
export class User extends BaseModel {
  @Field()
  @Column()
  email: string;
}
