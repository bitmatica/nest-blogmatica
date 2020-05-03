import { Type } from '@nestjs/common'
import { Resolver } from '@nestjs/graphql'
import { Create, Delete, Get, List, Update } from './actions'
import { ActionMap, DynamicService, IAction, ResolverAction } from './types'

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

export function BaseModelResolver<T, U extends ActionMap<T>>(
  objectType: Type<T>,
): DynamicService<T, U>

export function BaseModelResolver<T, U extends ActionMap<T>>(
  objectType: Type<T>,
  without?: U,
): DynamicService<T, U>

export function BaseModelResolver<T, U extends ActionMap<T>>(
  modelClass: Type<T>,
  without?: U,
): DynamicService<T, U> {
  const allBaseResolvers = defaultResolvers.filter(
    resolver =>
      !!without && Object.values(without).find(action => resolver === action),
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
