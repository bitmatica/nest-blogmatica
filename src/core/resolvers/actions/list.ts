import { ForbiddenException, Type } from '@nestjs/common'
import { Info, Query, Resolver } from '@nestjs/graphql'
import { GraphQLResolveInfo } from 'graphql'
import { ActionScope, Can, FAKE_CURRENT_USER, RecordScope } from '../../can'
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
  const user = FAKE_CURRENT_USER
  if (!user) throw new ForbiddenException()

  const recordScope = Can.check(user, ActionScope.Read, modelClass)
  if (recordScope === RecordScope.None) throw new ForbiddenException()

  const filters: Record<string, string> = {}
  if (recordScope === RecordScope.Owned) {
    const ownershipField = Can.ownedBy(modelClass)
    filters[ownershipField] = user.id
  }

  return constructQueryWithRelations(modelClass, info).where(filters).getMany()
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
