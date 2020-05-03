import { Type } from '@nestjs/common'
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
import {
  IActionOptions,
  IActionResolverArgsOptions,
  IActionResolverBuilder,
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

export function UpdateModelArgs<TModel>(
  modelClass: Type<TModel>,
  opts?: IActionResolverArgsOptions,
) {
  const argType = opts?.type || defaultUpdateModelInput(modelClass)
  return Args(opts?.name || 'input', {
    type: () => argType,
  })
}

export type IUpdateActionResolver<T> = (
  repo: Repository<T>,
  id: string,
  input: IUpdateModelInput<T>,
  context: IContext,
) => Promise<IMutationResponse<T>>

export class Update<T> implements IActionResolverBuilder {
  private readonly name: string
  private readonly response: Type<any>
  private readonly decorator: MethodDecorator
  private readonly input: Type<any>
  private readonly arg: ParameterDecorator
  private readonly resolver: IUpdateActionResolver<T>

  constructor(
    private modelClass: Type<T>,
    options?: IActionOptions<T, IUpdateActionResolver<T>>,
  ) {
    this.name = options?.name || Update.Name(modelClass)
    this.response = options?.response || Update.Response(modelClass)
    this.decorator =
      options?.resolverDecorator ||
      Update.Decorator(modelClass, {
        name: this.name,
        returns: this.response,
      })

    this.input = options?.input || Update.Input(modelClass)
    this.arg =
      options?.argDecorator ||
      Update.Arg(modelClass, {
        type: this.input,
      })

    this.resolver = options?.resolver || Update.Resolver(modelClass)
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

  static Decorator<T>(
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

  static Resolver<T>(modelClass: Type<T>): IUpdateActionResolver<T> {
    return async (
      repo: Repository<T>,
      id: string,
      input: IUpdateModelInput<T>,
      context: IContext,
    ): Promise<MutationResponse<T>> => {
      try {
        const model = await repo.findOne(id)
        if (!model) {
          return {
            success: false,
            message: `${modelClass.name} with id ${id} does not exist.`,
          }
        }

        Can.check(context, ActionScope.Update, modelClass).assert(
          model,
          context,
        )

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
  }

  build(innerClass: Type<any>): Type<any> {
    const resolverHandle = this.resolver

    @Resolver(() => this.modelClass, { isAbstract: true })
    class CreateModelResolverClass extends innerClass implements IUpdate<T> {
      @InjectRepository(this.modelClass)
      repo: Repository<T>

      @(this.decorator)
      async update(
        @IdInput id: string,
        @(this.arg) input: IUpdateModelInput<T>,
        @Context() context: IContext,
      ): Promise<IMutationResponse<T>> {
        return resolverHandle(this.repo, id, input, context)
      }
    }

    return CreateModelResolverClass
  }
}
