import { Type } from '@nestjs/common';
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
} from '@nestjs/graphql';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseModel } from './model';
import { DeletionResponse, MutationResponse } from './types';

export interface ResourceResolver<TModel> {
  repo: Repository<TModel>

  get(id: string): Promise<TModel | undefined>

  list(): Promise<Array<TModel>>

  create(input: Omit<TModel, 'id'>): Promise<MutationResponse<TModel>>

  update(id: string, input: Partial<TModel>): Promise<MutationResponse<TModel>>

  delete(id: string): Promise<DeletionResponse>
}

export function BaseResolver<TModel>(ModelCls: Type<TModel>): Type<ResourceResolver<TModel>> {
  const resourceNameOriginal = ModelCls.name;
  const resourceNameLowerCase = resourceNameOriginal.toLocaleLowerCase();

  @InputType(`Create${resourceNameOriginal}Input`)
  class CreateModelInput extends OmitType(ModelCls as unknown as Type<BaseModel>, [ 'id' ], InputType) {}

  @InputType(`Update${resourceNameOriginal}Input`)
  class UpdateModelInput extends PartialType(OmitType(ModelCls as unknown as Type<BaseModel>, [ 'id' ]), InputType) {}

  @ObjectType(`${resourceNameOriginal}MutationResponse`)
  class ModelMutationResponse extends MutationResponse<TModel> {
    @Field(type => ModelCls, { name: resourceNameLowerCase, nullable: true })
    model?: TModel;
  }

  @Resolver(of => ModelCls, { isAbstract: true })
  class ResourceResolverClass implements ResourceResolver<TModel> {
    @InjectRepository(ModelCls)
    repo: Repository<TModel>;

    @Query(returns => ModelCls, { name: resourceNameLowerCase })
    async get(@Args('id', { type: () => ID }) id: string): Promise<TModel | undefined> {
      return this.repo.findOne(id);
    }

    @Query(returns => [ ModelCls ], { name: `${resourceNameLowerCase}s` })
    async list(): Promise<Array<TModel>> {
      return this.repo.find();
    }

    @Mutation(returns => ModelMutationResponse, { name: `create${resourceNameOriginal}` })
    async create(@Args('input', { type: () => CreateModelInput }) input: Omit<TModel, 'id'>): Promise<MutationResponse<TModel>> {
      try {
        const model = new ModelCls();
        Object.assign(model, { ...input });
        const saved = await this.repo.save(model);

        return {
          success: true,
          message: `${resourceNameOriginal} created.`,
          model: saved,
        };
      } catch (err) {
        return {
          success: false,
          message: err.message,
        };
      }
    }

    @Mutation(returns => ModelMutationResponse, { name: `update${resourceNameOriginal}` })
    async update(
      @Args('id', { type: () => ID }) id: string,
      @Args('input', { type: () => UpdateModelInput }) input: Partial<TModel>,
    ): Promise<MutationResponse<TModel>> {
      try {
        const model = await this.repo.findOne(id);
        if (!model) {
          return {
            success: false,
            message: `${resourceNameOriginal} with id ${id} does not exist.`
          }
        }

        Object.assign(model, { ...input });
        await this.repo.save(model);
        return {
          success: true,
          message: `${resourceNameOriginal} updated.`,
          model,
        };
      } catch (err) {
        return {
          success: false,
          message: err.message,
        };
      }
    }

    @Mutation(returns => DeletionResponse, { name: `delete${resourceNameOriginal}` })
    async delete(@Args('id', { type: () => ID }) id: string): Promise<DeletionResponse> {
      try {
        const model = await this.repo.findOne(id);
        if (!model) {
          return {
            success: false,
            message: `${resourceNameOriginal} with id ${id} does not exist.`
          }
        }
        await this.repo.delete(model);
        return {
          success: true,
          message: `${resourceNameOriginal} deleted.`,
        };
      } catch (err) {
        return {
          success: false,
          message: err.message,
        };
      }
    }
  }

  return ResourceResolverClass;
}
