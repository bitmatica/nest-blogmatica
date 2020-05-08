import { Todo } from './todo.entity'
import { Resolver, ResolveField, Args, Int, Query, Context, Info, Mutation } from '@nestjs/graphql'
import { TodosService } from './todos.service'
import { IContext } from '../core/context'
import { GraphQLResolveInfo } from 'graphql'
import { ICreateModelInput, IUpdateModelInput, MutationResponse } from '../core/resolvers/types'
import { Create, Update } from '../core/resolvers/actions'

const createInput = Create.Input(Todo)
const updateInput = Update.Input(Todo)

@Resolver(() => Todo)
export class TodosResolver {
  constructor(private todosService: TodosService) {}

  @Query(returns => [Todo])
  async todos(
    @Context() context: IContext,
    @Info() info: GraphQLResolveInfo,
  ): Promise<Array<Todo> | undefined> {
    return this.todosService.list(context, info)
  }

  @Query(returns => Todo)
  async todo(
    @Args('id') id: string,
    @Context() context: IContext,
    @Info() info: GraphQLResolveInfo,
  ): Promise<Todo | undefined> {
    return this.todosService.get(id, context, info)
  }

  @Mutation(returns => MutationResponse)
  async updateTodo(
    @Args('id') id: string,
    @Args('input', { type: () => updateInput }) input: IUpdateModelInput<Todo>,
    @Context() context: IContext,
    @Info() info: GraphQLResolveInfo,
  ): Promise<MutationResponse<Todo>> {
    return this.todosService.update(id, input, context, info)
  }

  @Mutation(returns => MutationResponse)
  async deleteTodo(
    @Args('id') id: string,
    @Context() context: IContext,
    @Info() info: GraphQLResolveInfo,
  ): Promise<MutationResponse<Todo>> {
    return this.todosService.delete(id, context, info)
  }

  @Mutation(returns => MutationResponse)
  async createTodo(
    @Args('input', { type: () => createInput }) input: ICreateModelInput<Todo>,
    @Context() context: IContext,
    @Info() info: GraphQLResolveInfo,
  ): Promise<MutationResponse<Todo>> {
    return this.todosService.create(input, context, info)
  }
}
