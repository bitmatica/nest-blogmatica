import { ForbiddenException, Type, UseGuards } from '@nestjs/common'
import { Args, Context, Field, InputType, Mutation, ObjectType, OmitType, Resolver } from '@nestjs/graphql'
import { InjectRepository } from '@nestjs/typeorm'
import { getMetadataArgsStorage, Repository } from 'typeorm'
import { ActionScope, Can } from '../../can'
import { IContext } from '../../context'
import { BASE_MODEL_FIELDS } from '../../model'
import { createModelResolverName } from '../helpers/naming'
import { IActionResolverArgsOptions, IActionResolverOptions, ICreateModelInput, MutationResponse } from '../types'
import { JwtAuthGuard } from '../../../authentication/guards/jwt-auth.guard'

export interface ICreate<TModel> {
  create(input: ICreateModelInput<TModel>, context: IContext): Promise<MutationResponse<TModel>>
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
  context: IContext,
): Promise<MutationResponse<TModel>> {
  try {
    const model = new modelClass()
    Object.assign(model, { ...input })

    const recordScope = Can.check(context, ActionScope.Create, modelClass)
    if (!recordScope.validate(model, context)) throw new ForbiddenException()

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

function ApplyAuth<TModel>(modelClass: Type<TModel>, actionScope: ActionScope)

export function Create<TModel>(modelClass: Type<TModel>, innerClass: Type<any>): Type<ICreate<TModel>> {
  @Resolver(() => modelClass, { isAbstract: true })
  class CreateModelResolverClass extends innerClass implements ICreate<TModel> {
    @InjectRepository(modelClass)
    repo: Repository<TModel>

    @UseGuards(JwtAuthGuard)
    @CreateModelMutation(modelClass)
    async create(@CreateModelArgs(modelClass) input: ICreateModelInput<TModel>, @Context() context: IContext): Promise<MutationResponse<TModel>> {
      return defaultCreateModelMutation(modelClass, this.repo, input, context)
    }
  }

  return CreateModelResolverClass
}
