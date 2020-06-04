import { Column, Entity, ManyToOne, DeleteDateColumn } from 'typeorm'
import { BaseModel, ModelId } from '../core/model'
import { User } from '../users/user.entity'

@Entity()
export class AuthSession extends BaseModel {
  @Column()
  refreshToken: string

  @ManyToOne(type => User, { nullable: false, lazy: true, cascade: ['remove'] })
  user: Promise<User>

  @Column()
  userId: ModelId

  @Column({ type: 'timestamptz' })
  expiry: Date

  @DeleteDateColumn()
  deletedAt: Date
}
