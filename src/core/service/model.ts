import { Type } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { GraphQLResolveInfo } from 'graphql'
import { Repository } from 'typeorm'
import { ActionScope, Can } from '../can'
import { IContext } from '../context'
import { constructQueryWithRelations } from '../resolvers/helpers/relations'
import { ICreateModelInput, IUpdateModelInput, MutationResponse } from '../resolvers/types'
import { IBaseService } from './types'

export function BaseModelService<T>(modelClass: Type<T>): Type<IBaseService<T>> {
  class BaseService implements IBaseService<T> {
    constructor(@InjectRepository(modelClass) private repo: Repository<T>) {}

    async create(
      input: ICreateModelInput<T>,
      context: IContext,
      info?: GraphQLResolveInfo,
    ): Promise<MutationResponse<T>> {
      try {
        const model = new modelClass()
        Object.assign(model, { ...input })

        Can.check(context, ActionScope.Create, modelClass).assert(model, context)

        const saved = await this.repo.save(model)

        if (!saved) {
          return {
            success: false,
            message: 'Error occurred while saving',
          }
        }

        return {
          success: true,
          message: `${modelClass.name} created.`,
          model: saved,
        }
      } catch (err) {
        return {
          success: false,
          message: err.message,
        }
      }
    }

    async delete(
      id: string,
      context: IContext,
      info?: GraphQLResolveInfo,
    ): Promise<MutationResponse<T>> {
      try {
        const model = await this.repo.findOne(id)
        if (!model) {
          return {
            success: false,
            message: `${modelClass.name} with id ${id} does not exist.`,
          }
        }

        Can.check(context, ActionScope.Delete, modelClass).assert(model, context)

        await this.repo.delete(model)
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

    get(id: string, context: IContext, info: GraphQLResolveInfo): Promise<T | undefined> {
      return constructQueryWithRelations(modelClass, info, context).getOne()
    }

    list(context: IContext, info: GraphQLResolveInfo): Promise<Array<T>> {
      return constructQueryWithRelations(modelClass, info, context).getMany()
    }

    async update(
      id: string,
      input: IUpdateModelInput<T>,
      context: IContext,
      info?: GraphQLResolveInfo,
    ): Promise<MutationResponse<T>> {
      try {
        const model = await this.repo.findOne(id)
        if (!model) {
          return {
            success: false,
            message: `${modelClass.name} with id ${id} does not exist.`,
          }
        }

        Can.check(context, ActionScope.Update, modelClass).assert(model, context)

        Object.assign(model, { ...input })
        await this.repo.save(model)

        return {
          success: true,
          message: `${modelClass.name} updated.`,
          model,
        }
      } catch (err) {
        return {
          success: false,
          message: err.message,
        }
      }
    }
  }

  return BaseService
}
