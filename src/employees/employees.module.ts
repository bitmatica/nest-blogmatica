import { HttpService, Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { EmployeesResolver } from './employees.resolver'
import { Employee } from './employee.entity'
import { EmployeesService } from './employees.service'

@Module({
  imports: [HttpService],
  providers: [EmployeesResolver, EmployeesService],
})
export class EmployeesModule {}
