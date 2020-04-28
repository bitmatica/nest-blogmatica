import { ForbiddenException, Type } from '@nestjs/common'
import { Args, ID, Info, Query, Resolver } from '@nestjs/graphql'
import { InjectRepository } from '@nestjs/typeorm'
import { GraphQLResolveInfo } from 'graphql'
import { getMetadataArgsStorage, Repository } from 'typeorm'
import { ActionScope, Can, FAKE_CURRENT_USER, RecordScope } from '../../can'
import { getModelResolverName } from '../helpers/naming'
import { getSelectedRelations } from '../helpers/relations'

export interface IGet<TModel> {
  get(id: string, info: GraphQLResolveInfo): Promise<TModel | undefined>
}

export function Get<TModel>(modelClass: Type<TModel>, innerClass: Type<any>): Type<IGet<TModel>> {
  const tormMetadata = getMetadataArgsStorage()
  const relations = tormMetadata.relations.filter(r => r.target === modelClass)

  @Resolver(of => modelClass, { isAbstract: true })
  class GetModelResolverClass extends innerClass implements IGet<TModel> {
    @InjectRepository(modelClass)
    repo: Repository<TModel>

    @Query(returns => modelClass, { name: getModelResolverName(modelClass), nullable: true })
    async get(
      @Args('id', { type: () => ID }) id: string,
      @Info() info: GraphQLResolveInfo,
    ): Promise<TModel | undefined> {
      const user = FAKE_CURRENT_USER

      const recordScope = Can.check(user, ActionScope.Read, modelClass)
      if (recordScope === RecordScope.None) throw new ForbiddenException()

      const filters: Record<string, string> = {}
      if (recordScope === RecordScope.Owned) {
        const ownershipField = Can.ownedBy(modelClass)
        filters[ownershipField] = user.id
      }

      return this.repo.findOne({ relations: getSelectedRelations(info, relations), where: filters })
    }
  }

  return GetModelResolverClass
}
