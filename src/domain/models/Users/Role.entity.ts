import {
  Entity,
  PrimaryKey,
  Property,
  ManyToMany,
  Collection,
  Index,
} from '@mikro-orm/core'
import User from '@models/Users/User.entity'

@Entity()
export default class Role {
  @PrimaryKey()
  id: string

  @Property({ onCreate: () => new Date() })
  createdAt: Date

  @Property({ onUpdate: () => new Date() })
  modifiedAt: Date

  @Property()
  name: string

  @ManyToMany(() => User, user => user.roles)
  @Index()
  users = new Collection<User>(this)
}
