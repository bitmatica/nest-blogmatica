import { ForbiddenException, Type } from '@nestjs/common'
import { Mutation, Resolver } from '@nestjs/graphql'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { ActionScope, Can } from '../../can'
import { FAKE_CONTEXT } from '../../context'
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
    const context = FAKE_CONTEXT
    if (!context.currentUser) throw new ForbiddenException()

    const model = await repo.findOne(id)
    if (!model) {
      return {
        success: false,
        message: `${modelClass.name} with id ${id} does not exist.`,
      }
    }

    const recordScope = Can.check(context, ActionScope.Delete, modelClass)
    if (!recordScope.validate(model, context)) throw new ForbiddenException()

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

  @Resolver(() => modelClass, { isAbstract: true })
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
