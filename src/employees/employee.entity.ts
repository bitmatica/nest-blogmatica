import { Field, Int, ObjectType } from '@nestjs/graphql'

@ObjectType()
export class Employee {
  @Field(type => Int)
  id: number

  @Field()
  name: string

  @Field(type => Int)
  salary: number

  @Field(type => Int)
  age: number

  @Field()
  profileImage: string
}
