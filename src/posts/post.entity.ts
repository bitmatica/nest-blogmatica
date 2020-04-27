import { Field, ObjectType } from '@nestjs/graphql'
import { Column, Entity, ManyToOne } from 'typeorm'
import { ActionScope, Can, RecordScope, UserScope } from '../core/can'
import { BaseModel } from '../core/model'
import { User } from '../users/user.entity'

@ObjectType()
@Entity()
@Can.register({
  ownershipField: 'authorId',
  permissions: [
    Can.do(ActionScope.Read).as(UserScope.Anyone).to(RecordScope.All),
    Can.do(ActionScope.Create).as(UserScope.Authenticated).to(RecordScope.Owned).withRole('postWriter'),
  ],
})
export class Post extends BaseModel {
  @Field()
  @Column()
  title: string

  @Field()
  @Column()
  body: string

  @Field(type => User)
  @ManyToOne(type => User, { nullable: false, lazy: true })
  author: Promise<User>

  @Column()
  authorId: string
}
