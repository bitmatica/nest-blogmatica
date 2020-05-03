import { Type } from '@nestjs/common'
import { Context, Info, Query, Resolver } from '@nestjs/graphql'
import { GraphQLResolveInfo } from 'graphql'
import { IContext } from '../../context'
import { IdInput } from '../decorators'
import { getModelResolverName } from '../helpers/naming'
import { constructQueryWithRelations } from '../helpers/relations'
import {
  IAction,
  IActionOptions,
  IActionResolverOptions,
  ResolverFunction,
} from '../types'

export interface IGet<TModel> {
  get(
    id: string,
    context: IContext,
    info: GraphQLResolveInfo,
  ): Promise<TModel | undefined>
}

export function defaultGetModelResponse<TModel>(modelClass: Type<TModel>) {
  return modelClass
}

export function defaultGetModelQuery<TModel>(
  modelClass: Type<TModel>,
  id: string,
  context: IContext,
  info: GraphQLResolveInfo,
): Promise<TModel | undefined> {
  return constructQueryWithRelations(modelClass, info, context).getOne()
}

export function GetModelQuery<TModel>(
  modelClass: Type<TModel>,
  opts?: IActionResolverOptions,
) {
  const returns = opts?.returns || defaultGetModelResponse(modelClass)
  return Query(ret => returns, {
    name: opts?.name || getModelResolverName(modelClass),
    nullable: true,
  })
}

export function Get<TModel>(
  modelClass: Type<TModel>,
  innerClass: Type<any>,
): Type<IGet<TModel>> {
  @Resolver(() => modelClass, { isAbstract: true })
  class GetModelResolverClass extends innerClass implements IGet<TModel> {
    @GetModelQuery(modelClass)
    async get(
      @IdInput id: string,
      @Context() context: IContext,
      @Info() info: GraphQLResolveInfo,
    ): Promise<TModel | undefined> {
      return defaultGetModelQuery(modelClass, id, context, info)
    }
  }

  return GetModelResolverClass
}

export type IGetActionResolver<T> = (
  id: string,
  context: IContext,
  info: GraphQLResolveInfo,
) => Promise<T | undefined>

export class GetAction<T, U extends ResolverFunction = IGetActionResolver<T>>
  implements IAction {
  private readonly decorator: MethodDecorator
  private readonly resolver: U
  private readonly response: Type<any>
  private readonly input: ParameterDecorator
  private readonly name: string

  constructor(private modelClass: Type<T>, options?: IActionOptions<T, U>) {
    this.name = options?.name || GetAction.Name(modelClass)
    this.response = options?.response || GetAction.Response(modelClass)

    this.decorator =
      options?.decorator ||
      GetAction.Decorator(modelClass, {
        returns: this.response,
        name: this.name,
      })

    this.input = options?.input || GetAction.Input(modelClass)

    this.resolver = options?.resolver || (GetAction.Resolver(modelClass) as any)
  }

  static Name<T>(modelClass: Type<T>): string {
    return modelClass.name.toLocaleLowerCase()
  }

  static Response<T>(modelClass: Type<T>): Type<T | undefined> {
    return modelClass
  }

  static Input<T>(modelClass: Type<T>): ParameterDecorator {
    return IdInput
  }

  static Decorator<T>(
    modelClass: Type<T>,
    opts?: IActionResolverOptions,
  ): MethodDecorator {
    const returns = opts?.returns || defaultGetModelResponse(modelClass)
    return Query(ret => returns, {
      name: opts?.name || getModelResolverName(modelClass),
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

  static Default<T>(modelClass: Type<T>): IAction {
    return new GetAction(modelClass)
  }

  build(innerClass: Type<any>): Type<IGet<T>> {
    const resolverHandle = this.resolver

    @Resolver(() => this.modelClass, { isAbstract: true })
    class GetModelResolverClass extends innerClass implements IGet<T> {
      @(this.decorator)
      async get(
        @(this.input) id: string,
        @Context() context: IContext,
        @Info() info: GraphQLResolveInfo,
      ) {
        return resolverHandle(id, context, info)
      }
    }

    return GetModelResolverClass
  }
}
