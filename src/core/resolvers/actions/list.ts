import { Type } from '@nestjs/common'
import { Context, Info, Query, Resolver } from '@nestjs/graphql'
import { GraphQLResolveInfo } from 'graphql'
import { IContext } from '../../context'
import { constructQueryWithRelations } from '../helpers/relations'
import {
  IActionOptions,
  IActionResolverBuilder,
  IActionResolverOptions,
} from '../types'

export interface IListResolver<T> {
  list(context: IContext, info: GraphQLResolveInfo): Promise<Array<T>>
}

export type IListActionResolver<T> = (
  context: IContext,
  info: GraphQLResolveInfo,
) => Promise<Array<T>>

export class List<T> implements IActionResolverBuilder {
  private readonly name: string
  private readonly response: any
  private readonly resolverDecorator: MethodDecorator
  private readonly resolver: IListActionResolver<T>

  constructor(
    private modelClass: Type<T>,
    options?: IActionOptions<T, IListActionResolver<T>>,
  ) {
    this.name = options?.name || List.Name(modelClass)
    this.response = options?.response || List.Response(modelClass)
    this.resolverDecorator =
      options?.resolverDecorator ||
      List.Decorator(modelClass, {
        name: this.name,
        returns: this.response,
      })

    this.resolver = options?.resolver || List.Resolver(modelClass)
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

  static Resolver<T>(modelClass: Type<T>): IListActionResolver<T> {
    return (context: IContext, info: GraphQLResolveInfo) => {
      return constructQueryWithRelations(modelClass, info, context).getMany()
    }
  }

  build(innerClass: Type<any>): Type<any> {
    const resolverHandle = this.resolver

    @Resolver(() => this.modelClass, { isAbstract: true })
    class ListModelResolverClass extends innerClass
      implements IListResolver<T> {
      @(this.resolverDecorator)
      async list(
        @Context() context: IContext,
        @Info() info: GraphQLResolveInfo,
      ): Promise<Array<T>> {
        return resolverHandle(context, info)
      }
    }

    return ListModelResolverClass
  }
}
