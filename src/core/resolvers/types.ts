import { Type } from '@nestjs/common'
import { Field, InterfaceType, ObjectType } from '@nestjs/graphql'

@ObjectType()
export class DeletionResponse {
  @Field()
  success: boolean

  @Field()
  message: string
}

export interface IMutationResponse<T> {
  success: boolean

  message: string

  model?: T
}

@InterfaceType()
export abstract class MutationResponse<T> implements IMutationResponse<T> {
  @Field()
  success: boolean

  @Field()
  message: string

  model?: T
}


export type ICreateModelInput<T> = Omit<T, 'id' | 'createdAt' | 'updatedAt'>
export type IUpdateModelInput<T> = Partial<ICreateModelInput<T>>
export declare type ResolverAction<T> = ((modelClass: Type<T>, innerClass: Type<any>) => Type<any>)

export interface IBaseResolverOptions<T> {
  with?: Array<ResolverAction<T>>,
  without?: Array<ResolverAction<T>>
}
