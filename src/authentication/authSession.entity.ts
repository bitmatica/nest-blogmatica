import { Column, Entity, ManyToOne } from 'typeorm'
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
}
