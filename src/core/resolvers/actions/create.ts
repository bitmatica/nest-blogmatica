import { ForbiddenException, Type } from '@nestjs/common'
import { Args, Field, InputType, Mutation, ObjectType, OmitType, Resolver } from '@nestjs/graphql'
import { InjectRepository } from '@nestjs/typeorm'
import { getMetadataArgsStorage, Repository } from 'typeorm'
import { ActionScope, Can, RecordScope } from '../../can'
import { FAKE_CONTEXT, FAKE_CURRENT_USER } from '../../context'
import { BASE_MODEL_FIELDS } from '../../model'
import { createModelResolverName } from '../helpers/naming'
import { IActionResolverArgsOptions, IActionResolverOptions, ICreateModelInput, MutationResponse } from '../types'

export interface ICreate<TModel> {
  create(input: ICreateModelInput<TModel>): Promise<MutationResponse<TModel>>
}

export function defaultCreateModelInput<TModel>(modelClass: Type<TModel>, without?: Array<keyof TModel>): Type<ICreateModelInput<TModel>> {
  const tormMetadata = getMetadataArgsStorage()
  const relations = tormMetadata.relations.filter(r => r.target === modelClass)
  const fieldsToOmit = relations
    .map(r => r.propertyName)
    .concat(without as Array<string> || BASE_MODEL_FIELDS)

  @InputType(`Create${modelClass.name}Input`)
  class CreateModelInput extends OmitType(modelClass as Type<any>, fieldsToOmit, InputType) {}

  return CreateModelInput as Type<ICreateModelInput<TModel>>
}

export function defaultCreateModelResponse<TModel>(modelClass: Type<TModel>): Type<MutationResponse<TModel>> {
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
    const context = FAKE_CONTEXT
    if (!context.currentUser) throw new ForbiddenException()

    const model = new modelClass()
    Object.assign(model, { ...input })

    const recordScope = Can.check(context, ActionScope.Create, modelClass)
    if (!recordScope.validate(model, FAKE_CONTEXT)) throw new ForbiddenException()

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

export function CreateModelMutation<TModel>(modelClass: Type<TModel>, opts?: IActionResolverOptions) {
  const returns = opts?.returns || defaultCreateModelResponse(modelClass)
  return Mutation(
    ret => returns,
    { name: opts?.name || createModelResolverName(modelClass) },
  )
}

export function CreateModelArgs<TModel>(modelClass: Type<TModel>, opts?: IActionResolverArgsOptions) {
  const argType = opts?.type || defaultCreateModelInput(modelClass)
  return Args(
    opts?.name || 'input',
    {
      type: () => argType,
    },
  )
}

export function Create<TModel>(modelClass: Type<TModel>, innerClass: Type<any>): Type<ICreate<TModel>> {
  @Resolver(() => modelClass, { isAbstract: true })
  class CreateModelResolverClass extends innerClass implements ICreate<TModel> {
    @InjectRepository(modelClass)
    repo: Repository<TModel>

    @CreateModelMutation(modelClass)
    async create(@CreateModelArgs(modelClass) input: ICreateModelInput<TModel>): Promise<MutationResponse<TModel>> {
      return defaultCreateModelMutation(modelClass, this.repo, input)
    }
  }

  return CreateModelResolverClass
}
