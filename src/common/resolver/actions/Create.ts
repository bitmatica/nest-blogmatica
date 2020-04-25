import { Type } from '@nestjs/common'
import { Args, Field, InputType, Mutation, ObjectType, OmitType, Resolver } from '@nestjs/graphql'
import { InjectRepository } from '@nestjs/typeorm'
import { getMetadataArgsStorage, Repository } from 'typeorm'
import { MutationResponse } from '../../types'
import { createModelResolverName } from '../helpers/naming'
import { ICreateModelInput } from '../model'

export interface ICreate<TModel> {
  create(input: ICreateModelInput<TModel>): Promise<MutationResponse<TModel>>
}

export function Create<TModel>(modelClass: Type<TModel>, innerClass: Type<any>): Type<ICreate<TModel>> {
  const modelNameOriginal = modelClass.name
  const modelNameLowerCase = modelNameOriginal.toLocaleLowerCase()

  const tormMetadata = getMetadataArgsStorage()
  const relations = tormMetadata.relations.filter(r => r.target === modelClass)

  const relationNames = relations
    .map(r => r.propertyName)
    .concat([ 'id', 'createdAt', 'updatedAt' ])

  @InputType(`Create${modelNameOriginal}Input`)
  class CreateModelInput extends OmitType(modelClass as unknown as Type<any>, relationNames, InputType) {}

  @ObjectType(`${modelNameOriginal}CreationResponse`)
  class ModelCreationResponse extends MutationResponse<TModel> {
    @Field(type => modelClass, { name: modelNameLowerCase, nullable: true })
    model?: TModel
  }

  @Resolver(of => modelClass, { isAbstract: true })
  class CreateModelResolverClass extends innerClass implements ICreate<TModel> {
    @InjectRepository(modelClass)
    repo: Repository<TModel>

    @Mutation(returns => ModelCreationResponse, { name: createModelResolverName(modelClass) })
    async create(@Args('input', { type: () => CreateModelInput }) input: ICreateModelInput<TModel>): Promise<MutationResponse<TModel>> {
      try {
        const model = new modelClass()
        Object.assign(model, { ...input })
        const saved = await this.repo.save(model)

        return {
          success: true,
          message: `${modelNameOriginal} created.`,
          model: saved,
        }
      } catch (err) {
        return {
          success: false,
          message: err.message,
        }
      }
    }
  }

  return CreateModelResolverClass
}
