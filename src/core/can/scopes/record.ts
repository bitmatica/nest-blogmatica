import { SelectQueryBuilder } from 'typeorm'
import { IContext } from '../../context'
import { ComputedValue, UserIdValue } from '../computedValues'

export type QueryBuilderFunction<T> = (qb: SelectQueryBuilder<T>) => string

export interface IRecordScope<T> {
  validate(record: T, context: IContext): boolean

  where(parentAlias: string, context: IContext): QueryBuilderFunction<T>
}

export abstract class BaseRecordScope<T> implements IRecordScope<T> {
  abstract validate(record: T, context: IContext): boolean

  abstract where(parentAlias: string, context: IContext): QueryBuilderFunction<T>
}

export class NoneRecordScope extends BaseRecordScope<any> {
  validate(): boolean {
    return false
  }

  where(): QueryBuilderFunction<any> {
    return () => {
      return 'true = false'
    }
  }
}

export class AllRecordScope extends BaseRecordScope<any> {
  validate(): boolean {
    return true
  }

  where(): QueryBuilderFunction<any> {
    return () => {
      return 'true = true'
    }
  }
}

export class EqualsRecordScope<T, U extends keyof T> extends BaseRecordScope<T> {
  constructor(public fieldName: U, public value: ComputedValue<T[U]> | T[U]) {
    super()
  }

  validate(model: T, context: IContext): boolean {
    const fieldValue = model[this.fieldName]
    const compareToValue = this.value instanceof ComputedValue ? this.value.get(context) : this.value
    return fieldValue === compareToValue
  }

  where(parentAlias: string, context: IContext): QueryBuilderFunction<T> {
    return () => {
      const compareToValue = this.value instanceof ComputedValue ? this.value.get(context) : this.value
      return compareToValue ? `${parentAlias}.${this.fieldName} = '${compareToValue}'` : 'true = false'
    }
  }
}

export class OwnedRecordScope<T> extends EqualsRecordScope<T, any> {
  constructor(public fieldName: keyof T) {
    super(fieldName, UserIdValue as any)
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
  None: new NoneRecordScope(),
  Owned: (fieldName: string) => new OwnedRecordScope(fieldName),
  All: new AllRecordScope(),
}
