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
  PartialType,
  Resolver,
} from '@nestjs/graphql'
import { getMetadataArgsStorage } from 'typeorm'
import { ActionScope } from '../../can'
import { CanAuth } from '../../can/decorators'
import { GraphQLResolveInfo } from 'graphql'
import { IContext } from '../../context'
import { BASE_MODEL_FIELDS } from '../../model'
import { IServiceProvider, IUpdateService } from '../../service/types'
import { IdInput } from '../decorators'
import {
  IActionOptions,
  IActionResolverArgsOptions,
  IActionResolverBuilder,
  IActionResolverOptions,
  IMutationResponse,
  IUpdateModelInput,
  MutationResponse,
} from '../types'

export interface IUpdateResolver<T> {
  update(
    id: string,
    input: IUpdateModelInput<T>,
    context: IContext,
    info: GraphQLResolveInfo,
  ): Promise<MutationResponse<T>> | MutationResponse<T>
}

export class Update<T> implements IActionResolverBuilder {
  private readonly name: string
  private readonly response: Type<any>
  private readonly decorator: MethodDecorator
  private readonly input: Type<any>
  private readonly arg: ParameterDecorator

  constructor(private modelClass: Type<T>, options?: IActionOptions<T>) {
    this.name = options?.name || Update.Name(modelClass)
    this.response = options?.response || Update.Response(modelClass)
    this.decorator =
      options?.resolverDecorator ||
      Update.Resolver(modelClass, {
        name: this.name,
        returns: this.response,
      })

    this.input = options?.input || Update.Input(modelClass)
    this.arg =
      options?.argDecorator ||
      Update.Arg(modelClass, {
        type: this.input,
      })
  }

  static Default<T>(modelClass: Type<T>): IActionResolverBuilder {
    return new Update(modelClass)
  }

  static Name<T>(modelClass: Type<T>): string {
    return `update${modelClass.name}`
  }

  static Response<T>(modelClass: Type<T>): Type<IMutationResponse<T>> {
    @ObjectType(`${modelClass.name}UpdateResponse`)
    class ModelUpdateResponse extends MutationResponse<T> {
      @Field(type => modelClass, {
        name: modelClass.name.toLocaleLowerCase(),
        nullable: true,
      })
      model?: T
    }

    return ModelUpdateResponse
  }

  static Resolver<T>(
    modelClass: Type<T>,
    opts?: IActionResolverOptions,
  ): MethodDecorator {
    const returns = opts?.returns || Update.Response(modelClass)
    return Mutation(ret => returns, {
      name: opts?.name || Update.Name(modelClass),
    })
  }

  static Input<T>(
    modelClass: Type<T>,
    without?: Array<keyof T>,
  ): Type<IUpdateModelInput<T>> {
    const tormMetadata = getMetadataArgsStorage()
    const relations = tormMetadata.relations.filter(
      r => r.target === modelClass,
    )
    const fieldsToOmit = relations
      .map(r => r.propertyName)
      .concat((without as Array<string>) || BASE_MODEL_FIELDS)

    @InputType(`Update${modelClass.name}Input`)
    class UpdateModelInput extends PartialType(
      OmitType((modelClass as unknown) as Type<any>, fieldsToOmit),
      InputType,
    ) {}

    return UpdateModelInput
  }

  static Arg<T>(modelClass: Type<T>, opts?: IActionResolverArgsOptions) {
    const argType = opts?.type || Update.Input(modelClass)
    return Args(opts?.name || 'input', {
      type: () => argType,
    })
  }

  build(
    innerClass: Type<IServiceProvider<IUpdateService<T>>>,
  ): Type<IUpdateResolver<T>> {
    @Resolver(() => this.modelClass, { isAbstract: true })
    class CreateModelResolverClass extends innerClass
      implements IUpdateResolver<T> {
      @CanAuth(this.modelClass, ActionScope.Update)
      @(this.decorator)
      update(
        @IdInput id: string,
        @(this.arg) input: IUpdateModelInput<T>,
        @Context() context: IContext,
        @Info() info: GraphQLResolveInfo,
      ): Promise<IMutationResponse<T>> | IMutationResponse<T> {
        return this.service.update(id, input, context, info)
      }
    }

    return CreateModelResolverClass
  }
}
