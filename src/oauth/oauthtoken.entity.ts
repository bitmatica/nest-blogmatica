import { Field } from '@nestjs/graphql'
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { ModelId } from '../core/model'
import { User } from '../users/user.entity'

export enum OAuthProvider {
  GUSTO = 'GUSTO',
  ASANA = 'ASANA',
  GOOGLE = 'GOOGLE',
  ZOOM = 'ZOOM',
  SLACK = 'SLACK',
  HUBSPOT = 'HUBSPOT',
}

@Entity()
export class OAuthToken {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Field(type => User)
  @ManyToOne(type => User, { nullable: false, lazy: true })
  user: Promise<User>

  @Column()
  userId: ModelId

  @Column({
    type: 'enum',
    enum: OAuthProvider,
  })
  provider: OAuthProvider

  @Column({ nullable: true })
  accessToken?: string

  @Column({ nullable: true })
  refreshToken?: string

  @Column({ nullable: true })
  tokenType?: string

  @Column({ nullable: true })
  tokenCreatedAt?: number //unix timestamp

  @Column({ nullable: true })
  expiresIn?: number
}
