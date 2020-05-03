import { Field, ID, ObjectType } from '@nestjs/graphql'
import {
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'

export type ModelId = string

@ObjectType()
export abstract class BaseModel {
  @Field(type => ID)
  @PrimaryGeneratedColumn('uuid')
  id: ModelId

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
