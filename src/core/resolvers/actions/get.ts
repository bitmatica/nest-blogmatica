import { Type } from '@nestjs/common'
import { Info, Query, Resolver } from '@nestjs/graphql'
import { GraphQLResolveInfo } from 'graphql'
import { FAKE_CONTEXT } from '../../context'
import { IdInput } from '../decorators'
import { getModelResolverName } from '../helpers/naming'
import { constructQueryWithRelations } from '../helpers/relations'
import { IActionResolverOptions } from '../types'

export interface IGet<TModel> {
  get(id: string, info: GraphQLResolveInfo): Promise<TModel | undefined>
}

export function defaultGetModelResponse<TModel>(modelClass: Type<TModel>) {
  return modelClass
}

export function defaultGetModelQuery<TModel>(modelClass: Type<TModel>, id: string, info: GraphQLResolveInfo): Promise<TModel | undefined> {
  const context = FAKE_CONTEXT
  return constructQueryWithRelations(modelClass, info, context).getOne()
}

export function GetModelQuery<TModel>(modelClass: Type<TModel>, opts?: IActionResolverOptions) {
  const returns = opts?.returns || defaultGetModelResponse(modelClass)
  return Query(
    ret => returns,
    {
      name: opts?.name || getModelResolverName(modelClass),
      nullable: true,
    },
  )
}

export function Get<TModel>(modelClass: Type<TModel>, innerClass: Type<any>): Type<IGet<TModel>> {
  @Resolver(() => modelClass, { isAbstract: true })
  class GetModelResolverClass extends innerClass implements IGet<TModel> {

    @GetModelQuery(modelClass)
    async get(@IdInput id: string, @Info() info: GraphQLResolveInfo): Promise<TModel | undefined> {
      return defaultGetModelQuery(modelClass, id, info)
    }
  }

  return GetModelResolverClass
}
