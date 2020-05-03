import { Type } from '@nestjs/common'
import { Field, ObjectType } from '@nestjs/graphql'
import { BaseModel } from '../model'

export interface IDeletionResponse {
  success: boolean
  message: string
}

@ObjectType()
export class DeletionResponse implements IDeletionResponse {
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

@ObjectType()
export abstract class MutationResponse<T> implements IMutationResponse<T> {
  @Field()
  success: boolean

  @Field()
  message: string

  model?: T
}

type OmitBaseModelKeys<T, U extends keyof T> = U extends keyof BaseModel
  ? never
  : U

type RemoveKeysOfType<T, U> = {
  [P in keyof T]: T[P] extends U ? never : P
}[keyof T]

type OmitRelationKeys<T> = RemoveKeysOfType<
  T,
  | PromiseLike<BaseModel>
  | PromiseLike<Array<BaseModel>>
  | BaseModel
  | Array<BaseModel>
>

type FilterInputKeys<T> = OmitBaseModelKeys<T, keyof T> & OmitRelationKeys<T>

export type ICreateModelInput<T> = Pick<T, FilterInputKeys<T>>

export type IUpdateModelInput<T> = Partial<ICreateModelInput<T>>

export interface IActionResolverOptions<T = any> {
  returns?: Type<any>
  name?: string
}

export interface IActionResolverArgsOptions<T = any> {
  type?: Type<T>
  name?: string
}

export type ResolverAction = IActionResolverBuilder | IAction

export interface IBaseResolverOptions {
  without?: Array<ResolverAction>
}

export type ResolverFunction = (...args: any) => any

export interface IActionOptions<T, U extends ResolverFunction> {
  name?: string
  resolverDecorator?: MethodDecorator
  input?: Type<any>
  response?: Type<any>
  resolver?: U
  argDecorator?: ParameterDecorator
}

export interface IActionResolverBuilder {
  build(innerClass: Type<any>): Type<any>
}

export interface IAction {
  Default<T>(modelClass: Type<T>): IActionResolverBuilder
}
