import { HttpModule, HttpService, Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { TodosResolver } from './todos.resolver'
import { Todo } from './todo.entity'
import { TodosService } from './todos.service'

@Module({
  imports: [HttpModule],
  providers: [TodosResolver, TodosService],
})
export class TodosModule {}
