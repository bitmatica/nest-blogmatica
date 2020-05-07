import { HttpService, Injectable } from '@nestjs/common'
import { Employee } from './employee.entity'

@Injectable()
export class EmployeesService {
  constructor(private httpService: HttpService) {}

  async list(): Promise<Array<Employee> | undefined> {
    const response = await this.httpService
      .get('http://dummy.restapiexample.com/api/v1/employees')
      .toPromise()

    console.log(response)

    //why am I able to instantiate this without supplying required fields?
    const employee = new Employee()
    employee.id = 1
    return [employee]
  }
}
