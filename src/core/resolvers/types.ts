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

export declare type ResolverAction<T> = (
  modelClass: Type<T>,
  innerClass: Type<any>,
) => Type<any>

export interface IActionResolverOptions<T = any> {
  returns?: Type<any>
  name?: string
}

export interface IActionResolverArgsOptions<T = any> {
  type?: Type<T>
  name?: string
}

export interface IBaseResolverOptions<T> {
  with?: Array<ResolverAction<T>>
  without?: Array<ResolverAction<T>>
}

export type ResolverFunction = (...args: any) => any

export type RemovePromise<T> = T extends PromiseLike<infer U> ? U : T

export type ResolverReturnType<T extends ResolverFunction> = RemovePromise<
  ReturnType<T>
>

export interface IActionOptions<T, U extends ResolverFunction> {
  name?: string
  decorator?: MethodDecorator
  input?: ParameterDecorator
  response?: Type<ResolverReturnType<U>>
  resolver?: U
}

export interface IAction {
  build(innerClass: Type<any>): Type<any>
}

export interface IActionBuilder {
  Name<T>(modelClass: Type<T>): string

  Response<T>(modelClass: Type<T>): Type<any>

  Decorator<T>(modelClass: Type<T>): MethodDecorator

  Input<T>(modelClass: Type<T>): ParameterDecorator

  Resolver<T>(modelClass: Type<T>): ResolverFunction

  Default<T>(modelClass: Type<T>): IAction
}
