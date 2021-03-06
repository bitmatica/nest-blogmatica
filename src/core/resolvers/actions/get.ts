import { Type } from '@nestjs/common'
import { Context, Info, Query, Resolver } from '@nestjs/graphql'
import { GraphQLResolveInfo } from 'graphql'
import { ActionScope } from '../../can'
import { CanAuth } from '../../can/decorators'
import { IContext } from '../../context'
import { IGetService, IServiceProvider } from '../../service/types'
import { IdInput } from '../decorators'
import { IActionOptions, IActionResolverBuilder, IActionResolverOptions } from '../types'

export interface IGetResolver<T> {
  get(id: string, context: IContext, info: GraphQLResolveInfo): Promise<T | undefined>
}

export class Get<T> implements IActionResolverBuilder {
  private readonly decorator: MethodDecorator
  private readonly response: Type<any>
  private readonly name: string

  constructor(private modelClass: Type<T>, options?: IActionOptions<T>) {
    this.name = options?.name || Get.Name(modelClass)
    this.response = options?.response || Get.Response(modelClass)

    this.decorator =
      options?.resolverDecorator ||
      Get.Resolver(modelClass, {
        returns: this.response,
        name: this.name,
      })
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

  static Resolver<T>(modelClass: Type<T>, opts?: IActionResolverOptions): MethodDecorator {
    const returns = opts?.returns || Get.Response(modelClass)
    return Query(ret => returns, {
      name: opts?.name || Get.Name(modelClass),
      nullable: true,
    })
  }

  build(innerClass: Type<IServiceProvider<IGetService<T>>>): Type<IGetResolver<T>> {
    @Resolver(() => this.modelClass, { isAbstract: true })
    class GetModelResolverClass extends innerClass implements IGetResolver<T> {
      @CanAuth(this.modelClass, ActionScope.Read)
      @(this.decorator)
      async get(
        @IdInput id: string,
        @Context() context: IContext,
        @Info() info: GraphQLResolveInfo,
      ) {
        return this.service.get(id, context, info)
      }
    }

    return GetModelResolverClass
  }
}
