import { Type } from '@nestjs/common'
import { Resolver } from '@nestjs/graphql'
import { Create, Delete, Get, List, Update } from './actions'
import { IBaseResolverOptions, ResolverAction } from './types'

export function BaseModelResolver<T>(objectType: Type<T>): any;

export function BaseModelResolver<T>(objectType: Type<T>, options: IBaseResolverOptions<T>): any;

export function BaseModelResolver<T>(objectType: Type<T>, options: IBaseResolverOptions<T> = {}): any {
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
