import { Type } from '@nestjs/common'
import { Resolver } from '@nestjs/graphql'
import { Create, Delete, Get, List, Update } from './actions'
import { IAction, IBaseResolverOptions, ResolverAction } from './types'

const defaultResolvers: Array<ResolverAction> = [
  Get,
  List,
  Create,
  Update,
  Delete,
]

function isAction(arg: any): arg is IAction {
  return arg.hasOwnProperty('Default')
}

export function BaseModelResolver<T>(objectType: Type<T>): any

export function BaseModelResolver<T>(
  objectType: Type<T>,
  options: IBaseResolverOptions,
): any

export function BaseModelResolver<T>(
  modelClass: Type<T>,
  options?: IBaseResolverOptions,
): any {
  const allBaseResolvers = (options?.with || defaultResolvers).filter(
    br => !options?.without?.find(withoutRes => withoutRes === br),
  )

  @Resolver({ isAbstract: true })
  class DefaultBaseResolver {}

  let returnClass: any = DefaultBaseResolver
  allBaseResolvers.forEach(resolverActionOrBuilder => {
    const resolver = isAction(resolverActionOrBuilder)
      ? resolverActionOrBuilder.Default(modelClass)
      : resolverActionOrBuilder

    @Resolver({ isAbstract: true })
    class InnerBaseResolver extends resolver.build(returnClass) {}

    returnClass = InnerBaseResolver
  })

  return returnClass
}
