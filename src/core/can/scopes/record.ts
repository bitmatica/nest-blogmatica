import { SelectQueryBuilder } from 'typeorm'
import { IContext } from '../../context'

export type QueryBuilderFunction<T> = (qb: SelectQueryBuilder<T>) => string

export interface IRecordScope<T> {
  validate(record: T, context: IContext): boolean

  where(parentAlias: string, context: IContext): QueryBuilderFunction<T>
}

export abstract class BaseRecordScope<T> implements IRecordScope<T> {
  abstract validate(record: T, context: IContext): boolean

  abstract where(parentAlias: string, context: IContext): QueryBuilderFunction<T>
}

export class NoneScope extends BaseRecordScope<any> {
  validate(): boolean {
    return false
  }

  where(): QueryBuilderFunction<any> {
    return () => {
      return 'true = false'
    }
  }
}

export class AllScope extends BaseRecordScope<any> {
  validate(): boolean {
    return true
  }

  where(): QueryBuilderFunction<any> {
    return () => {
      return 'true = true'
    }
  }
}

export class OwnedScope<T> extends BaseRecordScope<T> {
  constructor(public fieldName: keyof T) {
    super()
  }

  validate(model: T, context: IContext): boolean {
    const ownershipField = model[this.fieldName]
    return !!context.currentUser && context.currentUser.id === (ownershipField as unknown as string)
  }

  where(parentAlias: string, context: IContext): QueryBuilderFunction<T> {
    return () => {
      return context.currentUser ? `${parentAlias}.${this.fieldName} = '${context.currentUser.id}'` : 'true = false'
    }
  }
}

export class CombinedRecordScope<T> extends BaseRecordScope<T> {
  constructor(private scopes: Array<IRecordScope<T>>) {
    super()
  }

  where(parentAlias: string, context: IContext): QueryBuilderFunction<T> {
    return (qb) => {
      return this.scopes.map(scope => scope.where(parentAlias, context)(qb)).join(' OR ')
    }
  }

  validate(record: T, context: IContext): boolean {
    return this.scopes.reduce((prev: boolean, scope: IRecordScope<T>) => {
      return prev || scope.validate(record, context)
    }, false)
  }
}

export const RecordScope = {
  None: new NoneScope(),
  Owned: (fieldName: string) => new OwnedScope(fieldName),
  All: new AllScope(),
}
