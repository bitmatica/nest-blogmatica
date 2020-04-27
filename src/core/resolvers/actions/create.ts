import { ForbiddenException, Type } from '@nestjs/common'
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
  const relationNames = relations
    .map(r => r.propertyName)
    .concat(without as Array<string> || [ 'id', 'createdAt', 'updatedAt' ])

  @InputType(`Create${modelClass.name}Input`)
  class CreateModelInput extends OmitType(modelClass as Type<any>, relationNames, InputType) {}

  return CreateModelInput as Type<ICreateModelInput<TModel>>
}

export function defaultModelCreationResponse<TModel>(modelClass: Type<TModel>): Type<MutationResponse<TModel>> {
  @ObjectType(`${modelClass.name}CreationResponse`, { implements: MutationResponse })
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
    const saved = await repo.save(model)

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
  returns?: Type<any>
  name?: string,
}

export function CreateModelResolver<TModel>(modelClass: Type<TModel>, opts?: ICreateResolverOptions<any>) {
  const returns = opts?.returns || defaultModelCreationResponse(modelClass)
  return Mutation(
    ret => returns,
    { name: opts?.name || createModelResolverName(modelClass) },
  )
}

export interface ICreateResolverArgsOptions<T> {
  type?: Type<any>,
  name?: string,
}

export function CreateModelArgs<TModel>(modelClass: Type<TModel>, opts?: ICreateResolverArgsOptions<any>) {
  const argType = opts?.type || defaultCreateModelInput(modelClass)
  return Args(
    opts?.name || 'input',
    {
      type: () => argType,
    },
  )
}

export function Create<TModel>(modelClass: Type<TModel>, innerClass: Type<any>): Type<ICreate<TModel>> {
  const creationResponse = defaultModelCreationResponse(modelClass)
  const inputType = defaultCreateModelInput(modelClass)

  @Resolver(of => modelClass, { isAbstract: true })
  class CreateModelResolverClass extends innerClass implements ICreate<TModel> {
    @InjectRepository(modelClass)
    repo: Repository<TModel>

    @CreateModelResolver(modelClass, creationResponse)
    async create(@CreateModelArgs(modelClass, inputType) input: ICreateModelInput<TModel>): Promise<MutationResponse<TModel>> {
      return defaultCreateModelMutation(modelClass, this.repo, input)
    }
  }

  return CreateModelResolverClass
}
