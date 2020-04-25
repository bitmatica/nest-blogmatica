import { Type } from '@nestjs/common'
import { Args, ID, Mutation, Resolver } from '@nestjs/graphql'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { DeletionResponse } from '../../types'
import { deleteModelResolverName } from '../helpers/naming'

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
