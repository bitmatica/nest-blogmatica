import { Field } from '@nestjs/graphql'
import { Column, Entity, ManyToOne } from 'typeorm'
import { BaseModel, ModelId } from '../core/model'
import { User } from '../users/user.entity'

export enum OAuthProvider {
  GUSTO = 'gusto',
  ASANA = 'asana',
  GOOGLE = 'google',
}

@Entity()
export class OAuthToken extends BaseModel {
  @Column({
    type: 'enum',
    enum: OAuthProvider,
  })
  provider: OAuthProvider

  @Column()
  accessToken: string

  @Column()
  refreshToken: string

  @Column()
  expiresIn: number

  @Column()
  tokenType: string

  @Field(type => User)
  @ManyToOne(type => User, { nullable: false, lazy: true })
  user: Promise<User>

  @Column()
  userId: ModelId
}
