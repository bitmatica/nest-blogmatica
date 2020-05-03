import { Type } from '@nestjs/common'
import { Context, Mutation, Resolver } from '@nestjs/graphql'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { ActionScope, Can } from '../../can'
import { IContext } from '../../context'
import { IdInput } from '../decorators'
import {
  DeletionResponse,
  IActionOptions,
  IActionResolverBuilder,
  IActionResolverOptions,
  IDeletionResponse,
} from '../types'

export interface IDelete<TModel> {
  delete(id: string, context: IContext): Promise<DeletionResponse>
}

export type IDeleteActionResolver<T> = (
  repo: Repository<T>,
  id: string,
  context: IContext,
) => Promise<IDeletionResponse>

export class Delete<T> implements IActionResolverBuilder {
  private readonly name: string
  private readonly response: Type<any>
  private readonly resolverDecorator: MethodDecorator
  private readonly resolver: IDeleteActionResolver<T>

  constructor(
    private modelClass: Type<T>,
    options?: IActionOptions<T, IDeleteActionResolver<T>>,
  ) {
    this.name = options?.name || Delete.Name(modelClass)
    this.response = options?.response || Delete.Response(modelClass)
    this.resolverDecorator =
      options?.resolverDecorator ||
      Delete.Decorator(modelClass, {
        returns: this.response,
        name: this.name,
      })

    this.resolver = options?.resolver || Delete.Resolver(modelClass)
  }

  static Default<T>(modelClass: Type<T>): IActionResolverBuilder {
    return new Delete(modelClass)
  }

  static Name<T>(modelClass: Type<T>): string {
    return `delete${modelClass.name}`
  }

  static Response<T>(modelClass: Type<T>): Type<IDeletionResponse> {
    return DeletionResponse
  }

  static Resolver<T>(modelClass: Type<T>) {
    return async (
      repo: Repository<T>,
      id: string,
      context: IContext,
    ): Promise<DeletionResponse> => {
      try {
        const model = await repo.findOne(id)
        if (!model) {
          return {
            success: false,
            message: `${modelClass.name} with id ${id} does not exist.`,
          }
        }

        Can.check(context, ActionScope.Delete, modelClass).assert(
          model,
          context,
        )

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
  }

  static Decorator<T>(
    modelClass: Type<T>,
    opts?: IActionResolverOptions,
  ): MethodDecorator {
    const returns = opts?.returns || Delete.Response(modelClass)
    return Mutation(ret => returns, {
      name: opts?.name || Delete.Name(modelClass),
    })
  }

  build(innerClass: Type<any>): Type<IDelete<T>> {
    const resolverHandle = this.resolver

    @Resolver(() => this.modelClass, { isAbstract: true })
    class DeleteModelResolverClass extends innerClass implements IDelete<T> {
      @InjectRepository(this.modelClass)
      repo: Repository<T>

      @(this.resolverDecorator)
      async delete(
        @IdInput id: string,
        @Context() context: IContext,
      ): Promise<DeletionResponse> {
        return resolverHandle(this.repo, id, context)
      }
    }

    return DeleteModelResolverClass
  }
}
