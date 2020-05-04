import { Inject, Type } from '@nestjs/common'
import { Resolver } from '@nestjs/graphql'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { BaseModelService } from '../service/model'
import { IBaseService, IServiceProvider } from '../service/types'
import { Create, Delete, Get, List, Update } from './actions'
import {
  ActionMap,
  DynamicResolver,
  DynamicService,
  IAction,
  IBaseResolver,
  ResolverAction,
} from './types'

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

export function BaseModelResolver<T>(
  objectType: Type<T>,
): Type<IBaseResolver<T> & IServiceProvider<IBaseService<T>>>

export function BaseModelResolver<
  T,
  U extends ActionMap<T>,
  V extends DynamicService<T, U>
>(
  objectType: Type<T>,
  options: {
    with: U
  },
): Type<IBaseResolver<T> & IServiceProvider<V>>

export function BaseModelResolver<
  T,
  U extends ActionMap<T>,
  V extends DynamicService<T, U>
>(
  objectType: Type<T>,
  options: {
    service: Type<V>
    with?: U
  },
): Type<IBaseResolver<T> & IServiceProvider<V>>

export function BaseModelResolver<
  T,
  U extends ActionMap<T>,
  V extends DynamicService<T, U>
>(
  objectType: Type<T>,
  options: {
    without: U
  },
): Type<DynamicResolver<T, U> & IServiceProvider<IBaseService<T>>>

export function BaseModelResolver<
  T,
  U extends ActionMap<T>,
  V extends DynamicService<T, U>
>(
  objectType: Type<T>,
  options: {
    service: Type<V>
    without: U
  },
): Type<DynamicResolver<T, U> & IServiceProvider<V>>

export function BaseModelResolver<T, U extends ActionMap<T>>(
  modelClass: Type<T>,
  options?: {
    service?: Type<DynamicService<T, U>>
    without?: U
    with?: U
  },
) {
  const additionalResolvers = ((options?.with && Object.values(options.with)) ||
    []) as Array<ResolverAction>

  const allBaseResolvers = defaultResolvers
    .filter(
      resolver =>
        !(
          options?.without &&
          Object.values(options.without).find(action => resolver === action)
        ),
    )
    .filter(
      resolver =>
        !(
          typeof resolver === 'function' &&
          additionalResolvers.find(other => other instanceof resolver)
        ),
    )
    .concat(additionalResolvers)

  let returnClass: Type<any>

  if (options?.service) {
    @Resolver({ isAbstract: true })
    class DefaultBaseResolver {
      constructor(@Inject(options?.service) public service: IBaseService<T>) {}
    }

    returnClass = DefaultBaseResolver
  } else {
    @Resolver({ isAbstract: true })
    class DefaultBaseResolver {
      service: IBaseService<T>

      constructor(@InjectRepository(modelClass) private repo: Repository<T>) {
        const ServiceClass = BaseModelService(modelClass)
        this.service = new ServiceClass(repo)
      }
    }

    returnClass = DefaultBaseResolver
  }

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
