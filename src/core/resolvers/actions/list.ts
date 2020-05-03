import { Type } from '@nestjs/common'
import { Context, Info, Query, Resolver } from '@nestjs/graphql'
import { GraphQLResolveInfo } from 'graphql'
import { IContext } from '../../context'
import { IListService, IServiceProvider } from '../../service/types'
import {
  IActionOptions,
  IActionResolverBuilder,
  IActionResolverOptions,
} from '../types'

export interface IListResolver<T> {
  list(context: IContext, info: GraphQLResolveInfo): Promise<Array<T>>
}

export class List<T> implements IActionResolverBuilder {
  private readonly name: string
  private readonly response: any
  private readonly resolverDecorator: MethodDecorator

  constructor(private modelClass: Type<T>, options?: IActionOptions<T>) {
    this.name = options?.name || List.Name(modelClass)
    this.response = options?.response || List.Response(modelClass)
    this.resolverDecorator =
      options?.resolverDecorator ||
      List.Decorator(modelClass, {
        name: this.name,
        returns: this.response,
      })
  }

  static Default<T>(modelClass: Type<T>): IActionResolverBuilder {
    return new List(modelClass)
  }

  static Name<T>(modelClass: Type<T>): string {
    return `${modelClass.name.toLocaleLowerCase()}s`
  }

  static Response<T>(modelClass: Type<T>): Array<Type<T>> {
    return [modelClass]
  }

  static Decorator<T>(
    modelClass: Type<T>,
    opts?: IActionResolverOptions,
  ): MethodDecorator {
    const returns = opts?.returns || List.Response(modelClass)
    return Query(ret => returns, { name: opts?.name || List.Name(modelClass) })
  }

  build(innerClass: Type<IServiceProvider<IListService<T>>>): Type<any> {
    @Resolver(() => this.modelClass, { isAbstract: true })
    class ListModelResolverClass extends innerClass
      implements IListResolver<T> {
      @(this.resolverDecorator)
      async list(
        @Context() context: IContext,
        @Info() info: GraphQLResolveInfo,
      ): Promise<Array<T>> {
        return this.service.list(context, info)
      }
    }

    return ListModelResolverClass
  }
}
