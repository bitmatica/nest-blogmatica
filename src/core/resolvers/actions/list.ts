import { Type } from '@nestjs/common'
import { Info, Query, Resolver } from '@nestjs/graphql'
import { GraphQLResolveInfo } from 'graphql'
import { FAKE_CONTEXT } from '../../context'
import { listModelsResolverName } from '../helpers/naming'
import { constructQueryWithRelations } from '../helpers/relations'
import { IActionResolverOptions } from '../types'

export interface IList<TModel> {
  list(info: GraphQLResolveInfo): Promise<Array<TModel>>
}

export function defaultListModelResponse<TModel>(modelClass: Type<TModel>) {
  return [ modelClass ]
}

export function defaultListModelQuery<TModel>(modelClass: Type<TModel>, info: GraphQLResolveInfo): Promise<Array<TModel>> {
  const context = FAKE_CONTEXT
  return constructQueryWithRelations(modelClass, info, context).getMany()
}

export function ListModelQuery<TModel>(modelClass: Type<TModel>, opts?: IActionResolverOptions) {
  const returns = opts?.returns || defaultListModelResponse(modelClass)
  return Query(
    ret => returns,
    { name: listModelsResolverName(modelClass) },
  )
}

export function List<TModel>(modelClass: Type<TModel>, innerClass: Type<any>): Type<IList<TModel>> {
  @Resolver(() => modelClass, { isAbstract: true })
  class ListModelResolverClass extends innerClass implements IList<TModel> {
    @ListModelQuery(modelClass)
    async list(@Info() info: GraphQLResolveInfo): Promise<Array<TModel>> {
      return defaultListModelQuery(modelClass, info)
    }
  }

  return ListModelResolverClass
}
