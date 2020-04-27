import { ForbiddenException, Type } from '@nestjs/common'
import { Args, ID, Mutation, Resolver } from '@nestjs/graphql'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { ActionScope, Can, FAKE_CURRENT_USER, RecordScope } from '../../can'
import { deleteModelResolverName } from '../helpers/naming'
import { DeletionResponse } from '../types'

export interface IDelete<TModel> {
  delete(id: string): Promise<DeletionResponse>
}

export function Delete<TModel>(modelClass: Type<TModel>, innerClass: Type<any>): Type<IDelete<TModel>> {
  const modelNameOriginal = modelClass.name

  @Resolver(of => modelClass, { isAbstract: true })
  class DeleteModelResolverClass extends innerClass implements IDelete<TModel> {
    @InjectRepository(modelClass)
    repo: Repository<TModel>

    @Mutation(returns => DeletionResponse, { name: deleteModelResolverName(modelClass) })
    async delete(@Args('id', { type: () => ID }) id: string): Promise<DeletionResponse> {
      try {
        const model = await this.repo.findOne(id)

        const user = FAKE_CURRENT_USER
        const recordScope = Can.check(user, ActionScope.Delete, modelClass)
        if (recordScope === RecordScope.None) throw new ForbiddenException()
        if (recordScope === RecordScope.Owned) {
          const ownershipField = Can.ownedBy(modelClass)
          if (model[ownershipField] && model[ownershipField] !== user.id) {
            throw new ForbiddenException(`Can not delete ${modelClass.name} for other users.`)
          }
        }

        if (!model) {
          return {
            success: false,
            message: `${modelNameOriginal} with id ${id} does not exist.`,
          }
        }
        await this.repo.delete(model)
        return {
          success: true,
          message: `${modelNameOriginal} deleted.`,
        }
      } catch (err) {
        return {
          success: false,
          message: err.message,
        }
      }
    }
  }

  return DeleteModelResolverClass
}
