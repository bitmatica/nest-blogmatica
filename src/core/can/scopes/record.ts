import { ObjectLiteral, SelectQueryBuilder } from 'typeorm'
import { IContext } from '../../context'
import { ComputedValue, UserIdValue } from '../computedValues'

export interface WhereQueryResult {
  query: string,
  parameters?: ObjectLiteral
}

export type QueryBuilderFunction<T> = (qb: SelectQueryBuilder<T>) => WhereQueryResult

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
      return {
        query: 'true = false',
      }
    }
  }
}

export class AllRecordScope extends BaseRecordScope<any> {
  validate(): boolean {
    return true
  }

  where(): QueryBuilderFunction<any> {
    return () => {
      return {
        query: 'true = true',
      }
    }
  }
}

export type ComparatorValue<T> = ComputedValue<T> | T

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
      if (!compareToValue) {
        return {
          query: 'true = false',
        }
      }

      // TODO: Do we need to randomize this param name to avoid collision?
      const paramName = `${parentAlias}_${this.fieldName}`

      return {
        query: `${parentAlias}.${this.fieldName} = :${paramName}`,
        parameters: {
          [paramName]: compareToValue,
        },
      }
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
      return this.scopes
        .map(scope => scope.where(parentAlias, context)(qb))
        .reduce((prev, next) => {
          return {
            query: `${prev.query} OR ${next.query}`,
            parameters: {
              ...prev.parameters,
              ...next.parameters,
            },
          }
        })
    }
  }

  validate(record: T, context: IContext): boolean {
    return this.scopes.reduce((prev: boolean, scope: IRecordScope<T>) => {
      return prev || scope.validate(record, context)
    }, false)
  }
}

export abstract class RecordScope {
  static None = new NoneRecordScope()

  static All = new AllRecordScope()

  static Owned = <T>(fieldName: keyof T) => new OwnedRecordScope<T>(fieldName)

  static Where = <T, U extends keyof T>(fieldName: U, compareTo: ComparatorValue<T[U]>) => new EqualsRecordScope(fieldName, compareTo)
}
