import { ForbiddenException, Type, UseGuards } from '@nestjs/common'
import { Args, Field, InputType, Mutation, ObjectType, OmitType, PartialType, Resolver } from '@nestjs/graphql'
import { InjectRepository } from '@nestjs/typeorm'
import { getMetadataArgsStorage, Repository } from 'typeorm'
import { ActionScope, Can, FAKE_CURRENT_USER, RecordScope } from '../../can'
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
import { JwtAuthGuard } from '../../../authentication/guards/jwt-auth.guard'

export interface IUpdate<TModel> {
  update(id: string, input: IUpdateModelInput<TModel>): Promise<MutationResponse<TModel>>
}

export function defaultUpdateModelInput<TModel>(modelClass: Type<TModel>, without?: Array<keyof TModel>): Type<IUpdateModelInput<TModel>> {
  const tormMetadata = getMetadataArgsStorage()
  const relations = tormMetadata.relations.filter(r => r.target === modelClass)
  const fieldsToOmit = relations
    .map(r => r.propertyName)
    .concat(without as Array<string> || BASE_MODEL_FIELDS)

  @InputType(`Update${modelClass.name}Input`)
  class UpdateModelInput extends PartialType(OmitType(modelClass as unknown as Type<any>, fieldsToOmit), InputType) {}

  return UpdateModelInput as Type<IUpdateModelInput<TModel>>
}

export function defaultUpdateModelResponse<TModel>(modelClass: Type<TModel>): Type<IMutationResponse<TModel>> {
  @ObjectType(`${modelClass.name}UpdateResponse`)
  class ModelUpdateResponse extends MutationResponse<TModel> {
    @Field(type => modelClass, { name: modelClass.name.toLocaleLowerCase(), nullable: true })
    model?: TModel
  }

  return ModelUpdateResponse
}

export async function defaultUpdateModelMutation<TModel>(
 modelClass: Type<TModel>,
 repo: Repository<TModel>,
 id: string,
 input: IUpdateModelInput<TModel>,
): Promise<MutationResponse<TModel>> {
  try {
    const user = FAKE_CURRENT_USER
    if (!user) throw new ForbiddenException()

    const model = await repo.findOne(id)
    if (!model) {
      return {
        success: false,
        message: `${modelClass.name} with id ${id} does not exist.`,
      }
    }

    const recordScope = Can.check(user, ActionScope.Update, modelClass)
    if (recordScope === RecordScope.None) throw new ForbiddenException()
    if (recordScope === RecordScope.Owned) {
      // TODO: Need to figure out if we can get better type safety here, this is correct but strict mode is sad
      const ownershipField = model[Can.ownedBy(modelClass) as keyof TModel] as unknown as string
      if (ownershipField !== user.id) {
        throw new ForbiddenException(`Can not update ${modelClass.name} for other users.`)
      }
    }

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

export function UpdateModelArgs<TModel>(modelClass: Type<TModel>, opts?: IActionResolverArgsOptions) {
  const argType = opts?.type || defaultUpdateModelInput(modelClass)
  return Args(
    opts?.name || 'input',
    {
      type: () => argType,
    },
  )
}

export function UpdateModelMutation<TModel>(modelClass: Type<TModel>, opts?: IActionResolverOptions) {
  const returns = opts?.returns || defaultUpdateModelResponse(modelClass)
  return Mutation(
    ret => returns,
    { name: opts?.name || updateModelResolverName(modelClass) },
  )
}

export function Update<TModel>(modelClass: Type<TModel>, innerClass: Type<any>): Type<IUpdate<TModel>> {
  @Resolver(() => modelClass, { isAbstract: true })
  class CreateModelResolverClass extends innerClass implements IUpdate<TModel> {
    @InjectRepository(modelClass)
    repo: Repository<TModel>

    @UseGuards(JwtAuthGuard)
    @UpdateModelMutation(modelClass)
    async update(@IdInput id: string, @UpdateModelArgs(modelClass) input: IUpdateModelInput<TModel>): Promise<IMutationResponse<TModel>> {
      return defaultUpdateModelMutation(modelClass, this.repo, id, input)
    }
  }

  return CreateModelResolverClass
}
