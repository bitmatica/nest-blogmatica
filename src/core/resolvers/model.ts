import { Inject, Type } from '@nestjs/common'
import { Resolver } from '@nestjs/graphql'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { BaseModelService } from '../service/model'
import { IBaseService } from '../service/types'
import { Create, Delete, Get, List, Update } from './actions'
import {
  ActionMap,
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

export function BaseModelResolver<T, U extends ActionMap<T>>(
  objectType: Type<T>,
  options?: {
    service?: Type<IBaseService<T>>
  },
): Type<IBaseResolver<T>>

export function BaseModelResolver<T, U extends ActionMap<T>>(
  objectType: Type<T>,
  options: {
    service?: Type<IBaseService<T>>
    without: U
  },
): DynamicService<T, U>

export function BaseModelResolver<T, U extends ActionMap<T>>(
  modelClass: Type<T>,
  options?: {
    service?: Type<IBaseService<T>>
    without?: U
  },
): Type<IBaseResolver<T>> | DynamicService<T, U> {
  const allBaseResolvers = defaultResolvers.filter(
    resolver =>
      !(
        !!options?.without &&
        Object.values(options.without).find(action => resolver === action)
      ),
  )

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
