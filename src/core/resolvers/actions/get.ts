import { ForbiddenException, Type } from '@nestjs/common'
import { Info, Query, Resolver } from '@nestjs/graphql'
import { InjectRepository } from '@nestjs/typeorm'
import { GraphQLResolveInfo } from 'graphql'
import { getMetadataArgsStorage, Repository } from 'typeorm'
import { ActionScope, Can, FAKE_CURRENT_USER, RecordScope } from '../../can'
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
  const user = FAKE_CURRENT_USER
  if (!user) throw new ForbiddenException()

  const recordScope = Can.check(user, ActionScope.Read, modelClass)
  if (recordScope === RecordScope.None) throw new ForbiddenException()

  const filters: Record<string, string> = { id }
  if (recordScope === RecordScope.Owned) {
    const ownershipField = Can.ownedBy(modelClass)
    filters[ownershipField] = user.id
  }

  return constructQueryWithRelations(modelClass, info).where(filters).getOne()
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
