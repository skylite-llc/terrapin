import {
  OneToMany,
  ManyToMany,
  Collection,
  OneToOne,
  Index,
  Entity,
  PrimaryKey,
  Property,
} from '@mikro-orm/core'
import Flight from '@models/Airports/Flight.entity'
import Booking from '@models/Users/Booking.entity'
import Role from '@models/Users/Role.entity'
import UserProfile from '@models/Users/UserProfile.entity'

@Entity()
export default class User {
  @PrimaryKey()
  id: string

  @Property({ onCreate: () => new Date() })
  createdAt: Date

  @Property({ onUpdate: () => new Date() })
  modifiedAt: Date

  @Property()
  displayName: string

  @Property()
  email: string

  @Property()
  phone: string

  @OneToOne()
  @Index()
  userProfile: UserProfile

  @OneToMany(() => Booking, booking => booking.user)
  @Index()
  bookings = new Collection<Booking>(this)

  @ManyToMany(() => Role)
  roles = new Collection<Role>(this)
}
