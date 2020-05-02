import { Type } from '@nestjs/common'
import { Context, Info, Query, Resolver } from '@nestjs/graphql'
import { GraphQLResolveInfo } from 'graphql'
import { IContext } from '../../context'
import { listModelsResolverName } from '../helpers/naming'
import { constructQueryWithRelations } from '../helpers/relations'
import { IActionResolverOptions } from '../types'

export interface IList<TModel> {
  list(context: IContext, info: GraphQLResolveInfo): Promise<Array<TModel>>
}

export function defaultListModelResponse<TModel>(modelClass: Type<TModel>) {
  return [modelClass]
}

export function defaultListModelQuery<TModel>(
  modelClass: Type<TModel>,
  context: IContext,
  info: GraphQLResolveInfo,
): Promise<Array<TModel>> {
  return constructQueryWithRelations(modelClass, info, context).getMany()
}

export function ListModelQuery<TModel>(
  modelClass: Type<TModel>,
  opts?: IActionResolverOptions,
) {
  const returns = opts?.returns || defaultListModelResponse(modelClass)
  return Query(ret => returns, { name: listModelsResolverName(modelClass) })
}

export function List<TModel>(
  modelClass: Type<TModel>,
  innerClass: Type<any>,
): Type<IList<TModel>> {
  @Resolver(() => modelClass, { isAbstract: true })
  class ListModelResolverClass extends innerClass implements IList<TModel> {
    @ListModelQuery(modelClass)
    async list(
      @Context() context: IContext,
      @Info() info: GraphQLResolveInfo,
    ): Promise<Array<TModel>> {
      return defaultListModelQuery(modelClass, context, info)
    }
  }

  return ListModelResolverClass
}
