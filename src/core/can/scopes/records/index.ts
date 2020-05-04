import { Type } from '@nestjs/common'
import { getConnection } from 'typeorm'
import { parseScope } from './parser'
import { BooleanOperator, QueryFilter } from './types'

export const RecordScopeCustom = async <T>(
  className: Type<T>,
  filter: BooleanOperator<T> | QueryFilter<T>,
) => {
  const conn = getConnection()
  const rootAlias = className.name.toLocaleLowerCase()

  let query = conn
    .createQueryBuilder()
    .select(rootAlias)
    .from(className, rootAlias)

  const whereFilter = parseScope(className, query, rootAlias, filter)
  console.log('whereFilter', whereFilter)

  query = query.where(whereFilter.query, whereFilter.params)
  console.log(query.getQuery())

  const results = await query.getMany()
  console.log(results)
}
