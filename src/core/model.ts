import { Field, ID, ObjectType } from '@nestjs/graphql'
import {
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'

@ObjectType()
export abstract class BaseModel {
  @Field(type => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Field()
  @CreateDateColumn()
  createdAt: Date

  @Field()
  @UpdateDateColumn()
  updatedAt: Date
}

export const BASE_MODEL_FIELDS: Array<keyof BaseModel> = [
  'id',
  'createdAt',
  'updatedAt',
]
