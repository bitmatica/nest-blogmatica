import { Field, Int, ObjectType } from '@nestjs/graphql'

@ObjectType()
export class Todo {
  constructor(userId: number, id: number, title: string, completed: boolean) {
    this.userId = userId
    this.id = id
    this.title = title
    this.completed = completed
  }

  @Field(type => Int)
  userId: number

  @Field(type => Int)
  id: number

  @Field()
  title: string

  @Field(type => Boolean)
  completed: boolean
}
