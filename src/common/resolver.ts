import { Type } from '@nestjs/common'
import {
  Args,
  Field,
  ID,
  InputType,
  Mutation,
  ObjectType,
  OmitType,
  PartialType,
  Query,
  Resolver,
} from '@nestjs/graphql'
import { InjectRepository } from '@nestjs/typeorm'
import { getMetadataArgsStorage, Repository } from 'typeorm'
import {
  createModelResolverName,
  deleteModelResolverName,
  findManyModelsResolverName,
  findOneModelResolverName,
  updateModelResolverName,
} from './helpers/resolverNames'
import { DeletionResponse, MutationResponse } from './types'

export type ICreateModelInput<T> = Omit<T, 'id' | 'createdAt' | 'updatedAt'>

export interface ModelResolver<TModel> {
  repo: Repository<TModel>

  get(id: string): Promise<TModel | undefined>

  list(): Promise<Array<TModel>>

  create(input: ICreateModelInput<TModel>): Promise<MutationResponse<TModel>>

  update(id: string, input: Partial<ICreateModelInput<TModel>>): Promise<MutationResponse<TModel>>

  delete(id: string): Promise<DeletionResponse>
}


export function BaseModelResolver<TModel>(modelClass: Type<TModel>): Type<ModelResolver<TModel>> {
  const modelNameOriginal = modelClass.name
  const modelNameLowerCase = modelNameOriginal.toLocaleLowerCase()

  const tormMetadata = getMetadataArgsStorage()

  const relations = tormMetadata.relations
    .filter(r => r.target === modelClass)

  const relationNames = relations
    .map(r => r.propertyName)
    .concat([ 'id', 'createdAt', 'updatedAt' ])

  @InputType(`Create${modelNameOriginal}Input`)
  class CreateModelInput extends OmitType(modelClass as unknown as Type<any>, relationNames, InputType) {}

  @InputType(`Update${modelNameOriginal}Input`)
  class UpdateModelInput extends PartialType(OmitType(modelClass as unknown as Type<any>, relationNames), InputType) {}

  @ObjectType(`${modelNameOriginal}MutationResponse`)
  class ModelMutationResponse extends MutationResponse<TModel> {
    @Field(type => modelClass, { name: modelNameLowerCase, nullable: true })
    model?: TModel
  }

  @Resolver(of => modelClass, { isAbstract: true })
  class ModelResolverClass implements ModelResolver<TModel> {
    @InjectRepository(modelClass)
    repo: Repository<TModel>

    @Query(returns => modelClass, { name: findOneModelResolverName(modelClass), nullable: true })
    async get(@Args('id', { type: () => ID }) id: string): Promise<TModel | undefined> {
      return this.repo.findOne(id)
    }

    @Query(returns => [ modelClass ], { name: findManyModelsResolverName(modelClass) })
    async list(): Promise<Array<TModel>> {
      return this.repo.find()
    }

    @Mutation(returns => ModelMutationResponse, { name: createModelResolverName(modelClass) })
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

    @Mutation(returns => ModelMutationResponse, { name: updateModelResolverName(modelClass) })
    async update(
      @Args('id', { type: () => ID }) id: string,
      @Args('input', { type: () => UpdateModelInput }) input: Partial<ICreateModelInput<TModel>>,
    ): Promise<MutationResponse<TModel>> {
      try {
        const model = await this.repo.findOne(id)
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

    @Mutation(returns => DeletionResponse, { name: deleteModelResolverName(modelClass) })
    async delete(@Args('id', { type: () => ID }) id: string): Promise<DeletionResponse> {
      try {
        const model = await this.repo.findOne(id)
        if (!model) {
          return {
            success: false,
            message: `${modelNameOriginal} with id ${id} does not exist.`,
          }
        }
        await this.repo.delete(model)
        return {
          success: true,
          message: `${modelNameOriginal} deleted.`,
        }
      } catch (err) {
        return {
          success: false,
          message: err.message,
        }
      }
    }
  }

  // Note: the following isn't actually needed because marking a relation field
  //       with Promise<T> and either marking it with @Field(type => T) or
  //       using the CLI plugin causes the relation to get added to the schema
  //       and the default resolver just works because of how TypeORM handles
  //       Promise based relations.
  //       I have left this commented out because once we implement authorization
  //       or just want more control over generating those relation resolvers we
  //       will probably have to revisit this and this POC impl might be useful.

  // relations.forEach(r => {
  //   const methodName = r.propertyName
  //   const relationTypeName = extractTypeName(r.type)
  //   const relationTable = tormMetadata.tables.find(t => extractTypeName(t.target) === relationTypeName)
  //
  //   if (r.relationType === "many-to-one") {
  //     const joinColumnName = tormMetadata.joinColumns.find(jc => jc.propertyName === methodName && jc.target === ModelCls)?.name || `${methodName}Id`
  //
  //     addMethod(ModelResolverClass.prototype, methodName, async function(parent: TModel) {
  //       const conn = getConnection()
  //       return conn.createQueryBuilder()
  //         .select(methodName)
  //         .from(relationTable.target, methodName)
  //         .where(`${methodName}.id = :id`, { id: parent[joinColumnName] })
  //         .getOne()
  //     })
  //     decorateMethod(ModelResolverClass.prototype, methodName, ResolveField(type => relationTable.target as Function))
  //   }
  // })

  return ModelResolverClass
}
