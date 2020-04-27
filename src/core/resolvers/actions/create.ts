import { applyDecorators, ForbiddenException, Type } from '@nestjs/common'
import { Args, Field, InputType, Mutation, ObjectType, OmitType, Resolver } from '@nestjs/graphql'
import { InjectRepository } from '@nestjs/typeorm'
import { getMetadataArgsStorage, Repository } from 'typeorm'
import { ActionScope, Can, FAKE_CURRENT_USER, RecordScope } from '../../can'
import { createModelResolverName } from '../helpers/naming'
import { ICreateModelInput, MutationResponse } from '../types'

export interface ICreate<TModel> {
  create(input: ICreateModelInput<TModel>): Promise<MutationResponse<TModel>>
}

export function defaultCreateModelInput<TModel>(modelClass: Type<TModel>, without?: Array<keyof TModel>): Type<ICreateModelInput<TModel>> {
  const tormMetadata = getMetadataArgsStorage()
  const relations = tormMetadata.relations.filter(r => r.target === modelClass)
  console.log(relations)
  const relationNames = relations
    .map(r => r.propertyName)
    .concat(without as Array<string> || [ 'id', 'createdAt', 'updatedAt' ])

  @InputType(`Create${modelClass.name}Input`)
  class CreateModelInput extends OmitType(modelClass as Type<any>, relationNames, InputType) {}

  return CreateModelInput as Type<ICreateModelInput<TModel>>
}

export function defaultModelCreationResponse<TModel>(modelClass: Type<TModel>): Type<MutationResponse<TModel>> {
  @ObjectType(`${modelClass.name}CreationResponse`)
  class ModelCreationResponse extends MutationResponse<TModel> {
    @Field(type => modelClass, { name: modelClass.name.toLocaleLowerCase(), nullable: true })
    model?: TModel
  }

  return ModelCreationResponse
}

export async function defaultCreateModelMutation<TModel>(
  modelClass: Type<TModel>,
  repo: Repository<TModel>,
  input: ICreateModelInput<TModel>,
): Promise<MutationResponse<TModel>> {
  try {
    const user = FAKE_CURRENT_USER

    const recordScope = Can.check(user, ActionScope.Create, modelClass)
    if (recordScope === RecordScope.None) throw new ForbiddenException()
    if (recordScope === RecordScope.Owned) {
      const ownershipField = Can.ownedBy(modelClass)
      if (input[ownershipField] && input[ownershipField] !== user.id) {
        throw new ForbiddenException(`Can not create ${modelClass.name} for other users.`)
      }
    }

    const model = new modelClass()
    Object.assign(model, { ...input })
    const saved = await this.repo.save(model)

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

export interface ICreateResolverOptions<T> {
  name?: string,
  returns?: Type<T>
}

export function CreateModelResolver<TModel>(modelClass: Type<TModel>, opts?: ICreateResolverOptions<any>) {
  return applyDecorators(
    Mutation(
      returns => opts?.returns || defaultModelCreationResponse(modelClass),
      { name: opts?.name || createModelResolverName(modelClass) },
    ),
  )
}

export interface ICreateResolverOptions<T> {
  name?: string,
  type?: Type<T>
}

export function CreateModelArgs<TModel>(modelClass: Type<TModel>, opts?: ICreateResolverOptions<any>) {
  return Args(
    opts?.name || 'input',
    {
      type: () => opts?.returns || defaultModelCreationResponse(modelClass),
    },
  )
}

export function Create<TModel>(modelClass: Type<TModel>, innerClass: Type<any>): Type<ICreate<TModel>> {
  @Resolver(of => modelClass, { isAbstract: true })
  class CreateModelResolverClass extends innerClass implements ICreate<TModel> {
    @InjectRepository(modelClass)
    repo: Repository<TModel>

    @CreateModelResolver(modelClass)
    async create(@Args('input', { type: () => defaultCreateModelInput(modelClass) }) input: ICreateModelInput<TModel>): Promise<MutationResponse<TModel>> {
      return defaultCreateModelMutation(modelClass, this.repo, input)
    }
  }

  return CreateModelResolverClass
}