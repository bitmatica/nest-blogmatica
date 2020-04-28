import { Field, HideField, ObjectType } from '@nestjs/graphql';
import { Column, Entity, OneToMany } from 'typeorm'
import { ActionScope, Can, RecordScope, UserScope } from '../core/can'
import { BaseModel } from '../core/model'
import { Post } from '../posts/post.entity'
import * as bcrypt from 'bcrypt'

@ObjectType()
@Entity()
@Can.register({
  ownershipField: 'id',
  permissions: [
    Can.do(ActionScope.Read).as(UserScope.Anyone).to(RecordScope.Owned),
    Can.do(Can.everything()).as(UserScope.Authenticated).withRole('admin'),
  ],
})
export class User extends BaseModel {
  @Field()
  @Column({ unique: true })
  email: string

  @Field(type => [ Post ])
  @OneToMany(type => Post, post => post.author, { lazy: true })
  posts: Promise<Array<Post>>

  @HideField()
  @Column()
  passwordHash: string

  async setPassword(password: string): Promise<void> {
    const salt = await bcrypt.genSalt(10)
    this.passwordHash = await bcrypt.hash(password, salt)
  }

  async checkPassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.passwordHash)
  }
}
