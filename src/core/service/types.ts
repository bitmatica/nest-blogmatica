import { GraphQLResolveInfo } from 'graphql'
import { IContext } from '../context'
import { ICreateModelInput, IUpdateModelInput, ModelMutationResponse } from '../resolvers/types'

export interface ICreateService<T> {
  create(
    input: ICreateModelInput<T>,
    context: IContext,
    info?: GraphQLResolveInfo,
  ): Promise<ModelMutationResponse<T>> | ModelMutationResponse<T>
}

export interface IGetService<T> {
  get(
    id: string,
    context: IContext,
    info: GraphQLResolveInfo,
  ): Promise<T | undefined> | T | undefined
}

export interface IListService<T> {
  list(context: IContext, info: GraphQLResolveInfo): Promise<Array<T>> | Array<T>
}

export interface IUpdateService<T> {
  update(
    id: string,
    input: IUpdateModelInput<T>,
    context: IContext,
    info?: GraphQLResolveInfo,
  ): Promise<ModelMutationResponse<T>> | ModelMutationResponse<T>
}

export interface IDeleteService<T> {
  delete(
    id: string,
    context: IContext,
    info?: GraphQLResolveInfo,
  ): Promise<ModelMutationResponse<T>> | ModelMutationResponse<T>
}

export type IBaseService<T> = ICreateService<T> &
  IGetService<T> &
  IListService<T> &
  IUpdateService<T> &
  IDeleteService<T>

export interface IServiceProvider<T> {
  service: T
}
