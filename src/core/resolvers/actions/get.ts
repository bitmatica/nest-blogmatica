import { Type } from '@nestjs/common'
import { Context, Info, Query, Resolver } from '@nestjs/graphql'
import { GraphQLResolveInfo } from 'graphql'
import { IContext } from '../../context'
import { IdInput } from '../decorators'
import { constructQueryWithRelations } from '../helpers/relations'
import {
  IActionOptions,
  IActionResolverBuilder,
  IActionResolverOptions,
} from '../types'

export interface IGet<TModel> {
  get(
    id: string,
    context: IContext,
    info: GraphQLResolveInfo,
  ): Promise<TModel | undefined>
}

export type IGetActionResolver<T> = (
  id: string,
  context: IContext,
  info: GraphQLResolveInfo,
) => Promise<T | undefined>

export class Get<T> implements IActionResolverBuilder {
  private readonly decorator: MethodDecorator
  private readonly resolver: IGetActionResolver<T>
  private readonly response: Type<any>
  private readonly name: string

  constructor(
    private modelClass: Type<T>,
    options?: IActionOptions<T, IGetActionResolver<T>>,
  ) {
    this.name = options?.name || Get.Name(modelClass)
    this.response = options?.response || Get.Response(modelClass)

    this.decorator =
      options?.resolverDecorator ||
      Get.Decorator(modelClass, {
        returns: this.response,
        name: this.name,
      })

    this.resolver = options?.resolver || (Get.Resolver(modelClass) as any)
  }

  static Default<T>(modelClass: Type<T>): IActionResolverBuilder {
    return new Get(modelClass)
  }

  static Name<T>(modelClass: Type<T>): string {
    return modelClass.name.toLocaleLowerCase()
  }

  static Response<T>(modelClass: Type<T>): Type<T | undefined> {
    return modelClass
  }

  static Decorator<T>(
    modelClass: Type<T>,
    opts?: IActionResolverOptions,
  ): MethodDecorator {
    const returns = opts?.returns || Get.Response(modelClass)
    return Query(ret => returns, {
      name: opts?.name || Get.Name(modelClass),
      nullable: true,
    })
  }

  static Resolver<T>(modelClass: Type<T>) {
    return (
      id: string,
      context: IContext,
      info: GraphQLResolveInfo,
    ): Promise<T | undefined> => {
      return constructQueryWithRelations(modelClass, info, context).getOne()
    }
  }

  build(innerClass: Type<any>): Type<IGet<T>> {
    const resolverHandle = this.resolver

    @Resolver(() => this.modelClass, { isAbstract: true })
    class GetModelResolverClass extends innerClass implements IGet<T> {
      @(this.decorator)
      async get(
        @IdInput id: string,
        @Context() context: IContext,
        @Info() info: GraphQLResolveInfo,
      ) {
        return resolverHandle(id, context, info)
      }
    }

    return GetModelResolverClass
  }
}
