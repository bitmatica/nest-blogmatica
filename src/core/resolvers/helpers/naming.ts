import { Type } from '@nestjs/common'

export function getModelResolverName<TModel>(ModelCls: Type<TModel>): string {
  return ModelCls.name.toLocaleLowerCase()
}

export function listModelsResolverName<TModel>(ModelCls: Type<TModel>): string {
  return `${ModelCls.name.toLocaleLowerCase()}s`
}

export function createModelResolverName<TModel>(ModelCls: Type<TModel>): string {
  return `create${ModelCls.name}`
}

export function updateModelResolverName<TModel>(ModelCls: Type<TModel>): string {
  return `update${ModelCls.name}`
}

export function deleteModelResolverName<TModel>(ModelCls: Type<TModel>): string {
  return `delete${ModelCls.name}`
}
