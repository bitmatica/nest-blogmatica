import { HttpService, Injectable } from '@nestjs/common'
import { Todo } from './todo.entity'
import { IBaseService } from '../core/service/types'
import { ICreateModelInput, IUpdateModelInput, MutationResponse } from '../core/resolvers/types'
import { IContext } from '../core/context'
import { GraphQLResolveInfo } from 'graphql'
import { Update } from 'src/core/resolvers/actions/update'

@Injectable()
export class TodosService implements IBaseService<Todo> {
  constructor(private httpService: HttpService) {}

  async create(
    input: ICreateModelInput<Todo>,
    context: IContext,
    info: GraphQLResolveInfo | undefined,
  ): Promise<MutationResponse<Todo>> {
    return await this.httpService
      .post<TodoJson>('https://jsonplaceholder.typicode.com/todos/', {
        input,
      })
      .toPromise()
      .then(res => {
        console.log(res.data)

        return { message: 'message', success: true }
      })
  }

  async delete(
    id: string,
    context: IContext,
    info: GraphQLResolveInfo | undefined,
  ): Promise<MutationResponse<Todo>> {
    return await this.httpService
      .delete<TodoJson>('https://jsonplaceholder.typicode.com/todos/' + id)
      .toPromise()
      .then(res => {
        console.log(res.data)

        return { message: 'message', success: true }
      })
  }

  async get(id: string, context: IContext, info: GraphQLResolveInfo): Promise<Todo | undefined> {
    const response = await this.httpService
      .get<TodoJson>('https://jsonplaceholder.typicode.com/todos/' + id)
      .toPromise()
      .catch(err => {
        console.log(err)
        throw err
      })

    return this.parseTodo(response.data)
  }

  async list(context: IContext, info: GraphQLResolveInfo): Promise<Array<Todo>> {
    const response = await this.httpService
      .get<Array<TodoJson>>('https://jsonplaceholder.typicode.com/todos')
      .toPromise()

    console.log(response.data)

    return response.data.map(this.parseTodo)
  }

  async update(
    id: string,
    input: IUpdateModelInput<Todo>,
    context: IContext,
    info: GraphQLResolveInfo | undefined,
  ): Promise<MutationResponse<Todo>> {
    return await this.httpService
      .put<TodoJson>('https://jsonplaceholder.typicode.com/todos/' + id, {
        input,
      })
      .toPromise()
      .then(res => {
        console.log(res.data)

        return { message: 'message', success: true }
      })
  }

  parseTodo(e: TodoJson): Todo {
    return new Todo(e.userId, e.id, e.title, e.completed)
  }
}

interface TodoJson {
  userId: number
  id: number
  title: string
  completed: boolean
}
