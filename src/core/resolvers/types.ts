import { Type } from '@nestjs/common'
import { Field, ObjectType } from '@nestjs/graphql'
import { BaseModel } from '../model'
import {
  IBaseService,
  ICreateService,
  IDeleteService,
  IGetService,
  IListService,
  IUpdateService,
} from '../service/types'
import {
  ICreateResolver,
  IDeleteResolver,
  IGetResolver,
  IListResolver,
  IUpdateResolver,
} from './actions'

export interface IMutationResponse {
  success: boolean
  message: string
}

@ObjectType()
export class MutationResponse implements IMutationResponse {
  @Field()
  success: boolean

  @Field()
  message: string
}

export interface IModelMutationResponse<T> {
  success: boolean

  message: string

  model?: T
}

@ObjectType()
export abstract class ModelMutationResponse<T> implements IModelMutationResponse<T> {
  @Field()
  success: boolean

  @Field()
  message: string

  model?: T
}

type OmitBaseModelKeys<T, U extends keyof T> = U extends keyof BaseModel ? never : U

type RemoveKeysOfType<T, U> = {
  [P in keyof T]: T[P] extends U ? never : P
}[keyof T]

type OmitRelationKeys<T> = RemoveKeysOfType<
  T,
  PromiseLike<BaseModel> | PromiseLike<Array<BaseModel>> | BaseModel | Array<BaseModel>
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

export type ResolverAction<T = any> = IActionResolverBuilder<T> | IAction

export interface IActionOptions<T> {
  name?: string
  resolverDecorator?: MethodDecorator
  input?: Type<any>
  response?: Type<any>
  argDecorator?: ParameterDecorator
}

export interface IActionResolverBuilder<T = any> {
  build(innerClass: Type<any>): Type<T>
}

export interface IAction {
  Default<T>(modelClass: Type<T>): IActionResolverBuilder<T>
}

export type IBaseResolver<T> = IGetResolver<T> &
  IListResolver<T> &
  ICreateResolver<T> &
  IUpdateResolver<T> &
  IDeleteResolver<T>

type ResolverActionKeyMap<T> = {
  Get: keyof IGetResolver<T>
  List: keyof IListResolver<T>
  Create: keyof ICreateResolver<T>
  Update: keyof IUpdateResolver<T>
  Delete: keyof IDeleteResolver<T>
}

type ServiceActionKeyMap<T> = {
  Get: keyof IGetService<T>
  List: keyof IListService<T>
  Create: keyof ICreateService<T>
  Update: keyof IUpdateService<T>
  Delete: keyof IDeleteService<T>
}

export type ActionMap<T> = {
  Get?: ResolverAction<IGetResolver<T>>
  List?: ResolverAction<IListResolver<T>>
  Create?: ResolverAction<ICreateResolver<T>>
  Update?: ResolverAction<IUpdateResolver<T>>
  Delete?: ResolverAction<IDeleteResolver<T>>
}

type SelectResolverActions<T, U> = {
  [P in keyof U]: P extends keyof ResolverActionKeyMap<T> ? ResolverActionKeyMap<T>[P] : never
}[keyof U]

type SelectServiceActions<T, U> = {
  [P in keyof U]: P extends keyof ServiceActionKeyMap<T> ? ServiceActionKeyMap<T>[P] : never
}[keyof U]

export type DynamicResolver<T, U extends ActionMap<T>> = Omit<
  IBaseResolver<T>,
  SelectResolverActions<T, U>
>

export type DynamicService<T, U extends ActionMap<T>> = Omit<
  IBaseService<T>,
  SelectServiceActions<T, U>
>
