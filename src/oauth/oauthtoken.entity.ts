import { Field, ID } from '@nestjs/graphql'
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { BaseModel, ModelId } from '../core/model'
import { User } from '../users/user.entity'

export enum OAuthProvider {
  GUSTO = 'gusto',
  ASANA = 'asana',
  GOOGLE = 'google',
}

@Entity()
export class OAuthToken {
  @PrimaryGeneratedColumn('uuid')
  id: string

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
  createdAt: number

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
