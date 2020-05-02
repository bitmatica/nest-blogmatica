import { ForbiddenException, Type } from '@nestjs/common'
import {
  Args,
  Context,
  Field,
  InputType,
  Mutation,
  ObjectType,
  OmitType,
  PartialType,
  Resolver,
} from '@nestjs/graphql'
import { InjectRepository } from '@nestjs/typeorm'
import { getMetadataArgsStorage, Repository } from 'typeorm'
import { ActionScope, Can } from '../../can'
import { IContext } from '../../context'
import { BASE_MODEL_FIELDS } from '../../model'
import { IdInput } from '../decorators'
import { updateModelResolverName } from '../helpers/naming'
import {
  IActionResolverArgsOptions,
  IActionResolverOptions,
  IMutationResponse,
  IUpdateModelInput,
  MutationResponse,
} from '../types'

export interface IUpdate<TModel> {
  update(
    id: string,
    input: IUpdateModelInput<TModel>,
    context: IContext,
  ): Promise<MutationResponse<TModel>>
}

export function defaultUpdateModelInput<TModel>(
  modelClass: Type<TModel>,
  without?: Array<keyof TModel>,
): Type<IUpdateModelInput<TModel>> {
  const tormMetadata = getMetadataArgsStorage()
  const relations = tormMetadata.relations.filter(r => r.target === modelClass)
  const fieldsToOmit = relations
    .map(r => r.propertyName)
    .concat((without as Array<string>) || BASE_MODEL_FIELDS)

  @InputType(`Update${modelClass.name}Input`)
  class UpdateModelInput extends PartialType(
    OmitType((modelClass as unknown) as Type<any>, fieldsToOmit),
    InputType,
  ) {}

  return UpdateModelInput as Type<IUpdateModelInput<TModel>>
}

export function defaultUpdateModelResponse<TModel>(
  modelClass: Type<TModel>,
): Type<IMutationResponse<TModel>> {
  @ObjectType(`${modelClass.name}UpdateResponse`)
  class ModelUpdateResponse extends MutationResponse<TModel> {
    @Field(type => modelClass, {
      name: modelClass.name.toLocaleLowerCase(),
      nullable: true,
    })
    model?: TModel
  }

  return ModelUpdateResponse
}

export async function defaultUpdateModelMutation<TModel>(
  modelClass: Type<TModel>,
  repo: Repository<TModel>,
  id: string,
  input: IUpdateModelInput<TModel>,
  context: IContext,
): Promise<MutationResponse<TModel>> {
  try {
    const model = await repo.findOne(id)
    if (!model) {
      return {
        success: false,
        message: `${modelClass.name} with id ${id} does not exist.`,
      }
    }

    const recordScope = Can.check(context, ActionScope.Update, modelClass)
    if (!recordScope.validate(model, context)) throw new ForbiddenException()

    Object.assign(model, { ...input })
    await repo.save(model)

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

export function UpdateModelArgs<TModel>(
  modelClass: Type<TModel>,
  opts?: IActionResolverArgsOptions,
) {
  const argType = opts?.type || defaultUpdateModelInput(modelClass)
  return Args(opts?.name || 'input', {
    type: () => argType,
  })
}

export function UpdateModelMutation<TModel>(
  modelClass: Type<TModel>,
  opts?: IActionResolverOptions,
) {
  const returns = opts?.returns || defaultUpdateModelResponse(modelClass)
  return Mutation(ret => returns, {
    name: opts?.name || updateModelResolverName(modelClass),
  })
}

export function Update<TModel>(
  modelClass: Type<TModel>,
  innerClass: Type<any>,
): Type<IUpdate<TModel>> {
  @Resolver(() => modelClass, { isAbstract: true })
  class CreateModelResolverClass extends innerClass implements IUpdate<TModel> {
    @InjectRepository(modelClass)
    repo: Repository<TModel>

    @UpdateModelMutation(modelClass)
    async update(
      @IdInput id: string,
      @UpdateModelArgs(modelClass) input: IUpdateModelInput<TModel>,
      @Context() context: IContext,
    ): Promise<IMutationResponse<TModel>> {
      return defaultUpdateModelMutation(
        modelClass,
        this.repo,
        id,
        input,
        context,
      )
    }
  }

  return CreateModelResolverClass
}
