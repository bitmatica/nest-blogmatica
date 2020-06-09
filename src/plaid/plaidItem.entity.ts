import { Column, Entity, ManyToOne } from 'typeorm'
import { BaseModel, ModelId } from '../core/model'
import { User } from '../users/user.entity'

export const tableName = 'plaid_item'

@Entity()
export class PlaidItem extends BaseModel {
  @Column()
  itemId: string

  @Column({ type: 'bytea' })
  accessToken: string

  @ManyToOne(type => User, { nullable: false, lazy: true, cascade: ['remove'] })
  user: Promise<User>

  @Column()
  userId: ModelId
}
