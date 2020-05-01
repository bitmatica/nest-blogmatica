import { SelectQueryBuilder } from 'typeorm'
import { IContext } from '../../context'

export type QueryBuilderFunction<T> = (qb: SelectQueryBuilder<T>) => string

export interface IRecordScope<T> {
  weight: number

  validate(record: T, context: IContext): boolean

  queryBuilder(parentAlias: string, context: IContext): QueryBuilderFunction<T>
}

export abstract class BaseRecordScope<T> implements IRecordScope<T> {
  constructor(public weight: number) {}

  abstract validate(record: T, context: IContext): boolean

  abstract queryBuilder(parentAlias: string, context: IContext): QueryBuilderFunction<T>
}

class NoneScope extends BaseRecordScope<any> {
  constructor() {
    super(0)
  }

  validate(): boolean {
    return false
  }

  queryBuilder(): QueryBuilderFunction<any> {
    return () => {
      return 'true = false'
    }
  }
}

class AllScope extends BaseRecordScope<any> {
  constructor() {
    super(2)
  }

  validate(): boolean {
    return true
  }

  queryBuilder(): QueryBuilderFunction<any> {
    return () => {
      return 'true = true'
    }
  }
}

class OwnedScope<T> extends BaseRecordScope<T> {
  constructor(public fieldName: keyof T) {
    super(1)
  }

  validate(model: T, context: IContext): boolean {
    const ownershipField = model[this.fieldName]
    return !!context.currentUser && context.currentUser.id === (ownershipField as unknown as string)
  }

  queryBuilder(parentAlias: string, context: IContext): QueryBuilderFunction<T> {
    return () => {
      return `${parentAlias}.${this.fieldName} = '${context.currentUser?.id}'`
    }
  }
}

export const RecordScope = {
  None: new NoneScope(),
  Owned: (fieldName: string) => new OwnedScope(fieldName),
  All: new AllScope(),
}
