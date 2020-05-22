import { Type } from '@nestjs/common'
import {
  Args,
  Context,
  Field,
  Info,
  InputType,
  Mutation,
  ObjectType,
  OmitType,
  Resolver,
} from '@nestjs/graphql'
import { GraphQLResolveInfo } from 'graphql'
import { getMetadataArgsStorage } from 'typeorm'
import { ActionScope } from '../../can'
import { CanAuth } from '../../can/decorators'
import { IContext } from '../../context'
import { BASE_MODEL_FIELDS } from '../../model'
import { ICreateService, IServiceProvider } from '../../service/types'
import {
  IActionOptions,
  IActionResolverArgsOptions,
  IActionResolverBuilder,
  IActionResolverOptions,
  ICreateModelInput,
  ModelMutationResponse,
} from '../types'

export interface ICreateResolver<T> {
  create(
    input: ICreateModelInput<T>,
    context: IContext,
    info: GraphQLResolveInfo,
  ): Promise<ModelMutationResponse<T>> | ModelMutationResponse<T>
}

export class Create<T> implements IActionResolverBuilder {
  private readonly name: string
  private readonly response: Type<any>
  private readonly resolverDecorator: MethodDecorator
  private readonly input: Type<any>
  private readonly argDecorator: ParameterDecorator

  constructor(private modelClass: Type<T>, options?: IActionOptions<T>) {
    this.name = options?.name || Create.Name(modelClass)
    this.response = options?.response || Create.Response(modelClass)

    this.resolverDecorator =
      options?.resolverDecorator ||
      Create.Resolver(modelClass, {
        returns: this.response,
        name: this.name,
      })

    this.input = options?.input || Create.Input(modelClass)
    this.argDecorator = options?.argDecorator || Create.Arg(modelClass, { type: this.input })
  }

  static Default<T>(modelClass: Type<T>): IActionResolverBuilder {
    return new Create(modelClass)
  }

  static Name<T>(modelClass: Type<T>): string {
    return `create${modelClass.name}`
  }

  static Response<T>(modelClass: Type<T>): Type<ModelMutationResponse<T>> {
    @ObjectType(`${modelClass.name}CreationResponse`)
    class ModelCreationResponse extends ModelMutationResponse<T> {
      @Field(type => modelClass, {
        name: modelClass.name.toLocaleLowerCase(),
        nullable: true,
      })
      model?: T
    }

    return ModelCreationResponse
  }

  static Resolver<T>(modelClass: Type<T>, opts?: IActionResolverOptions): MethodDecorator {
    const returns = opts?.returns || Create.Response(modelClass)
    return Mutation(ret => returns, {
      name: opts?.name || Create.Name(modelClass),
    })
  }

  static Input<T>(modelClass: Type<T>, without?: Array<keyof T>): Type<any> {
    const tormMetadata = getMetadataArgsStorage()
    const relations = tormMetadata.relations.filter(r => r.target === modelClass)
    const fieldsToOmit = relations
      .map(r => r.propertyName)
      .concat((without as Array<string>) || BASE_MODEL_FIELDS)

    @InputType(`Create${modelClass.name}Input`)
    class CreateModelInput extends OmitType(modelClass as Type<any>, fieldsToOmit, InputType) {}

    return CreateModelInput as Type<ICreateModelInput<T>>
  }

  static Arg<T>(modelClass: Type<T>, opts?: IActionResolverArgsOptions) {
    const argType = opts?.type || Create.Input(modelClass)
    return Args(opts?.name || 'input', {
      type: () => argType,
    })
  }

  build(innerClass: Type<IServiceProvider<ICreateService<T>>>): Type<ICreateResolver<T>> {
    @Resolver(() => this.modelClass, { isAbstract: true })
    class CreateModelResolverClass extends innerClass implements ICreateResolver<T> {
      @CanAuth(this.modelClass, ActionScope.Create)
      @(this.resolverDecorator)
      create(
        @(this.argDecorator) input: ICreateModelInput<T>,
        @Context() context: IContext,
        @Info() info: GraphQLResolveInfo,
      ): Promise<ModelMutationResponse<T>> | ModelMutationResponse<T> {
        return this.service.create(input, context, info)
      }
    }

    return CreateModelResolverClass
  }
}
