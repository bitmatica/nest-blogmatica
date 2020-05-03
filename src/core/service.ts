import { OmitRelationKeys } from './resolvers/types'

interface IPaginationOptions {
  pagination?: {
    limit: number
    offset: number
  }
}

type IFilteringOptions<T> = {
  filters?: {
    [P in OmitRelationKeys<T>]?: T[P]
  }
}

enum ISortDirection {
  ASC,
  DESC,
}

interface ISortingOptions<T> {
  sorting?: {
    [P in OmitRelationKeys<T>]?: ISortDirection
  }
}

type IModelServiceListOptions<T> = IPaginationOptions &
  IFilteringOptions<T> &
  ISortingOptions<T>

interface IFilterableService<T> {
  list(id: string, options: IFilteringOptions<T>): Promise<T> | T
}

interface ISortableService<T> {
  list(id: string, options: ISortingOptions<T>): Promise<T> | T
}

interface IPaginateService<T> {
  list(id: string, options: IPaginationOptions): Promise<T> | T
}

type IModelService<T> = IFilterableService<T> &
  ISortableService<T> &
  IPaginateService<T>

class ModelService<T> implements IModelService<T> {
  get(id: string): Promise<T> {
    return {} as any
  }

  list(id: string, options?: IModelServiceListOptions<T>): Promise<T> | T {
    return {} as any
  }
}
