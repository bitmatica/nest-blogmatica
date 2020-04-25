import { Type } from '@nestjs/common'
import { Info, Query, Resolver } from '@nestjs/graphql'
import { InjectRepository } from '@nestjs/typeorm'
import { GraphQLResolveInfo } from 'graphql'
import { getMetadataArgsStorage, Repository } from 'typeorm'
import { findManyModelsResolverName } from '../helpers/naming'
import { getSelectedRelations } from '../helpers/relations'

export interface IList<TModel> {
  list(info: GraphQLResolveInfo): Promise<Array<TModel>>
}

export function List<TModel>(modelClass: Type<TModel>, innerClass: Type<any>): Type<IList<TModel>> {
  const tormMetadata = getMetadataArgsStorage()
  const relations = tormMetadata.relations.filter(r => r.target === modelClass)

  @Resolver(of => modelClass, { isAbstract: true })
  class ListModelResolverClass extends innerClass implements IList<TModel> {
    @InjectRepository(modelClass)
    repo: Repository<TModel>

    @Query(returns => [ modelClass ], { name: findManyModelsResolverName(modelClass) })
    async list(@Info() info: GraphQLResolveInfo): Promise<Array<TModel>> {
      return this.repo.find({ relations: getSelectedRelations(info, relations) })
    }
  }

  return ListModelResolverClass
}
