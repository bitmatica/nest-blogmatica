import { ForbiddenException, Type } from '@nestjs/common'
import { Mutation, Resolver } from '@nestjs/graphql'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { ActionScope, Can, FAKE_CURRENT_USER, RecordScope } from '../../can'
import { IdInput } from '../decorators'
import { deleteModelResolverName } from '../helpers/naming'
import { DeletionResponse, IActionResolverOptions } from '../types'

export interface IDelete<TModel> {
  delete(id: string): Promise<DeletionResponse>
}

export async function defaultDeleteModelMutation<TModel>(
  modelClass: Type<TModel>,
  repo: Repository<TModel>,
  id: string,
): Promise<DeletionResponse> {
  try {
    const model = await repo.findOne(id)

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
        message: `${modelClass.name} with id ${id} does not exist.`,
      }
    }
    await repo.delete(model)
    return {
      success: true,
      message: `${modelClass.name} deleted.`,
    }
  } catch (err) {
    return {
      success: false,
      message: err.message,
    }
  }
}

export function DeleteModelMutation<TModel>(modelClass: Type<TModel>, opts?: IActionResolverOptions) {
  const returns = opts?.returns || DeletionResponse
  return Mutation(
    ret => returns,
    { name: opts?.name || deleteModelResolverName(modelClass) },
  )
}

export function Delete<TModel>(modelClass: Type<TModel>, innerClass: Type<any>): Type<IDelete<TModel>> {

  @Resolver(of => modelClass, { isAbstract: true })
  class DeleteModelResolverClass extends innerClass implements IDelete<TModel> {
    @InjectRepository(modelClass)
    repo: Repository<TModel>

    @DeleteModelMutation(modelClass)
    async delete(@IdInput id: string): Promise<DeletionResponse> {
      return defaultDeleteModelMutation(modelClass, this.repo, id)
    }
  }

  return DeleteModelResolverClass
}
