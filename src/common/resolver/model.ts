import { Type } from '@nestjs/common'
import { Resolver } from '@nestjs/graphql'
import { Create, Delete, Get, List, Update } from './actions'

export type ICreateModelInput<T> = Omit<T, 'id' | 'createdAt' | 'updatedAt'>
export type IUpdateModelInput<T> = Partial<ICreateModelInput<T>>

export declare type ResolverAction<T> = ((modelClass: Type<T>, innerClass: Type<any>) => Type<any>)

export interface IBaseResolverOptions<T> {
  with?: Array<ResolverAction<T>>,
  without?: Array<ResolverAction<T>>
}

export function BaseModelResolver<T>(objectType: Type<T>);

export function BaseModelResolver<T>(objectType: Type<T>, options: IBaseResolverOptions<T>);

export function BaseModelResolver<T>(objectType: Type<T>, options: IBaseResolverOptions<T> = {}) {
  const defaultResolvers: Array<ResolverAction<T>> = [ Get, List, Create, Update, Delete ]
  const allBaseResolvers = (options.with || defaultResolvers).filter(br => !options.without?.find(withoutRes => withoutRes === br))

  @Resolver({ isAbstract: true })
  class DefaultBaseResolver {}

  let returnClass: any = DefaultBaseResolver
  allBaseResolvers.forEach(resolver => {
    @Resolver({ isAbstract: true })
    class InnerBaseResolver extends resolver(objectType, returnClass) {}

    returnClass = InnerBaseResolver
  })

  return returnClass
}
