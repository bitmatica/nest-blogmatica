import { ForbiddenException, Type } from '@nestjs/common'
import { Args, Field, ID, InputType, Mutation, ObjectType, OmitType, PartialType, Resolver } from '@nestjs/graphql'
import { InjectRepository } from '@nestjs/typeorm'
import { getMetadataArgsStorage, Repository } from 'typeorm'
import { ActionScope, Can, FAKE_CURRENT_USER, RecordScope } from '../../can'
import { updateModelResolverName } from '../helpers/naming'
import { IUpdateModelInput, MutationResponse } from '../types'

export interface IUpdate<TModel> {
  update(id: string, input: IUpdateModelInput<TModel>): Promise<MutationResponse<TModel>>
}

export function Update<TModel>(modelClass: Type<TModel>, innerClass: Type<any>): Type<IUpdate<TModel>> {
  const modelNameOriginal = modelClass.name
  const modelNameLowerCase = modelNameOriginal.toLocaleLowerCase()

  const tormMetadata = getMetadataArgsStorage()
  const relations = tormMetadata.relations.filter(r => r.target === modelClass)

  const relationNames = relations
    .map(r => r.propertyName)
    .concat([ 'id', 'createdAt', 'updatedAt' ])

  @InputType(`Update${modelNameOriginal}Input`)
  class UpdateModelInput extends PartialType(OmitType(modelClass as unknown as Type<any>, relationNames), InputType) {}

  @ObjectType(`${modelNameOriginal}UpdateResponse`)
  class ModelUpdateResponse extends MutationResponse<TModel> {
    @Field(type => modelClass, { name: modelNameLowerCase, nullable: true })
    model?: TModel
  }

  @Resolver(of => modelClass, { isAbstract: true })
  class CreateModelResolverClass extends innerClass implements IUpdate<TModel> {
    @InjectRepository(modelClass)
    repo: Repository<TModel>

    @Mutation(returns => ModelUpdateResponse, { name: updateModelResolverName(modelClass) })
    async update(
      @Args('id', { type: () => ID }) id: string,
      @Args('input', { type: () => UpdateModelInput }) input: IUpdateModelInput<TModel>,
    ): Promise<MutationResponse<TModel>> {
      try {
        const model = await this.repo.findOne(id)

        const user = FAKE_CURRENT_USER
        const recordScope = Can.check(user, ActionScope.Update, modelClass)
        if (recordScope === RecordScope.None) throw new ForbiddenException()
        if (recordScope === RecordScope.Owned) {
          const ownershipField = Can.ownedBy(modelClass)
          if (model[ownershipField] && model[ownershipField] !== user.id) {
            throw new ForbiddenException(`Can not update ${modelClass.name} for other users.`)
          }
        }

        if (!model) {
          return {
            success: false,
            message: `${modelNameOriginal} with id ${id} does not exist.`,
          }
        }

        Object.assign(model, { ...input })
        await this.repo.save(model)
        return {
          success: true,
          message: `${modelNameOriginal} updated.`,
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

  return CreateModelResolverClass
}
