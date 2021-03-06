import { Type } from '@nestjs/common'
import { Context, Info, Mutation, Resolver } from '@nestjs/graphql'
import { InjectRepository } from '@nestjs/typeorm'
import { GraphQLResolveInfo } from 'graphql'
import { Repository } from 'typeorm'
import { ActionScope } from '../../can'
import { CanAuth } from '../../can/decorators'
import { IContext } from '../../context'
import { IDeleteService, IServiceProvider } from '../../service/types'
import { IdInput } from '../decorators'
import {
  IActionOptions,
  IActionResolverBuilder,
  IActionResolverOptions,
  IMutationResponse,
  MutationResponse,
} from '../types'

export interface IDeleteResolver<T> {
  delete(
    id: string,
    context: IContext,
    info: GraphQLResolveInfo,
  ): Promise<MutationResponse> | MutationResponse
}

export class Delete<T> implements IActionResolverBuilder {
  private readonly name: string
  private readonly response: Type<any>
  private readonly resolverDecorator: MethodDecorator

  constructor(private modelClass: Type<T>, options?: IActionOptions<T>) {
    this.name = options?.name || Delete.Name(modelClass)
    this.response = options?.response || Delete.Response(modelClass)
    this.resolverDecorator =
      options?.resolverDecorator ||
      Delete.Resolver(modelClass, {
        returns: this.response,
        name: this.name,
      })
  }

  static Default<T>(modelClass: Type<T>): IActionResolverBuilder {
    return new Delete(modelClass)
  }

  static Name<T>(modelClass: Type<T>): string {
    return `delete${modelClass.name}`
  }

  static Response<T>(modelClass: Type<T>): Type<IMutationResponse> {
    return MutationResponse
  }

  static Resolver<T>(modelClass: Type<T>, opts?: IActionResolverOptions): MethodDecorator {
    const returns = opts?.returns || Delete.Response(modelClass)
    return Mutation(ret => returns, {
      name: opts?.name || Delete.Name(modelClass),
    })
  }

  build(innerClass: Type<IServiceProvider<IDeleteService<T>>>): Type<IDeleteResolver<T>> {
    @Resolver(() => this.modelClass, { isAbstract: true })
    class DeleteModelResolverClass extends innerClass implements IDeleteResolver<T> {
      @InjectRepository(this.modelClass)
      repo: Repository<T>

      @CanAuth(this.modelClass, ActionScope.Delete)
      @(this.resolverDecorator)
      delete(
        @IdInput id: string,
        @Context() context: IContext,
        @Info() info: GraphQLResolveInfo,
      ): Promise<MutationResponse> | MutationResponse {
        return this.service.delete(id, context, info)
      }
    }

    return DeleteModelResolverClass
  }
}
