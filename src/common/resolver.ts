import { Type } from '@nestjs/common';
import {
  Args,
  Field,
  ID,
  InputType, Int,
  Mutation,
  ObjectType,
  OmitType, Parent,
  PartialType,
  Query, ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { InjectRepository } from '@nestjs/typeorm';
import { getConnection, getMetadataArgsStorage, Repository } from 'typeorm';
import { BaseModel } from './model';
import { DeletionResponse, MutationResponse } from './types';

export type ICreateModelInput<T> = Omit<T, 'id' | 'createdAt' | 'updatedAt'>

export interface ModelResolver<TModel> {
  repo: Repository<TModel>

  get(id: string): Promise<TModel | undefined>

  list(): Promise<Array<TModel>>

  create(input: ICreateModelInput<TModel>): Promise<MutationResponse<TModel>>

  update(id: string, input: Partial<ICreateModelInput<TModel>>): Promise<MutationResponse<TModel>>

  delete(id: string): Promise<DeletionResponse>
}

function decorateMethod(classPrototype: any, propertyKey: string | symbol, decorator: MethodDecorator) {
  const desc = Object.getOwnPropertyDescriptor(classPrototype, propertyKey)
  const wrappedDesc = decorator(classPrototype, propertyKey, desc)
  if (wrappedDesc) {
    Object.defineProperty(classPrototype, propertyKey, wrappedDesc)
  }
}

function addMethod(classPrototype: any, propertyKey: string | symbol, fn: Function) {
  classPrototype[propertyKey] = fn
}

export function BaseModelResolver<TModel>(ModelCls: Type<TModel>): Type<ModelResolver<TModel>> {
  const modelNameOriginal = ModelCls.name;
  const modelNameLowerCase = modelNameOriginal.toLocaleLowerCase();

  const tormMetadata = getMetadataArgsStorage()
  const relationNames = tormMetadata.relations
    .filter(r => r.target === ModelCls)
    .map(r => r.propertyName)
    .concat([ 'id', 'createdAt', 'updatedAt' ])

  @InputType(`Create${modelNameOriginal}Input`)
  class CreateModelInput extends OmitType(ModelCls as unknown as Type<any>, relationNames, InputType) {}

  @InputType(`Update${modelNameOriginal}Input`)
  class UpdateModelInput extends PartialType(OmitType(ModelCls as unknown as Type<any>, relationNames), InputType) {}

  @ObjectType(`${modelNameOriginal}MutationResponse`)
  class ModelMutationResponse extends MutationResponse<TModel> {
    @Field(type => ModelCls, { name: modelNameLowerCase, nullable: true })
    model?: TModel;
  }

  @Resolver(of => ModelCls, { isAbstract: true })
  class ModelResolverClass implements ModelResolver<TModel> {
    @InjectRepository(ModelCls)
    repo: Repository<TModel>;

    @Query(returns => ModelCls, { name: modelNameLowerCase, nullable: true })
    async get(@Args('id', { type: () => ID }) id: string): Promise<TModel | undefined> {
      return this.repo.findOne(id);
    }

    @Query(returns => [ ModelCls ], { name: `${modelNameLowerCase}s` })
    async list(): Promise<Array<TModel>> {
      return this.repo.find();
    }

    @Mutation(returns => ModelMutationResponse, { name: `create${modelNameOriginal}` })
    async create(@Args('input', { type: () => CreateModelInput }) input: ICreateModelInput<TModel>): Promise<MutationResponse<TModel>> {
      try {
        const model = new ModelCls();
        Object.assign(model, { ...input });
        const saved = await this.repo.save(model);

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

    @Mutation(returns => ModelMutationResponse, { name: `update${modelNameOriginal}` })
    async update(
      @Args('id', { type: () => ID }) id: string,
      @Args('input', { type: () => UpdateModelInput }) input: Partial<ICreateModelInput<TModel>>,
    ): Promise<MutationResponse<TModel>> {
      try {
        const model = await this.repo.findOne(id);
        if (!model) {
          return {
            success: false,
            message: `${modelNameOriginal} with id ${id} does not exist.`
          }
        }

        Object.assign(model, { ...input });
        await this.repo.save(model);
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

    @Mutation(returns => DeletionResponse, { name: `delete${modelNameOriginal}` })
    async delete(@Args('id', { type: () => ID }) id: string): Promise<DeletionResponse> {
      try {
        const model = await this.repo.findOne(id);
        if (!model) {
          return {
            success: false,
            message: `${modelNameOriginal} with id ${id} does not exist.`
          }
        }
        await this.repo.delete(model);
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

  return ModelResolverClass;
}
