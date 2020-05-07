import { Employee } from './employee.entity'
import { Resolver, ResolveField, Args, Int, Query } from '@nestjs/graphql'
import { EmployeesService } from './employees.service'

@Resolver(() => Employee)
export class EmployeesResolver {
  constructor(private employeesService: EmployeesService) {}

  //I tried to add returns to the Query as seen in the docs, it didnt compile
  @Query()
  async employee(): Promise<Array<Employee> | undefined> {
    return this.employeesService.list()
  }
}
