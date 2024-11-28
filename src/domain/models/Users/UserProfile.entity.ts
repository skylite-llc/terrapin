import { Entity, PrimaryKey, Property, OneToOne, Index } from '@mikro-orm/core'
import User from '@models/Users/User.entity'

@Entity()
export default class UserProfile {
  @PrimaryKey()
  id: string

  @Property({ onCreate: () => new Date() })
  createdAt: Date

  @Property({ onUpdate: () => new Date() })
  modifiedAt: Date

  @Property()
  dateOfBirth: string

  @OneToOne(() => User, user => user.userProfile)
  @Index()
  user: User
}
