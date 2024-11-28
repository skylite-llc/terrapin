import { Entity, PrimaryKey, Property, ManyToOne, Index } from '@mikro-orm/core'
import Flight from '@models//Airports/Flight.entity'
import User from '@models//Users/User.entity'

@Entity()
export default class Booking {
  @PrimaryKey()
  id: string

  @Property({ onCreate: () => new Date() })
  createdAt: Date

  @Property({ onUpdate: () => new Date() })
  modifiedAt: Date

  @Property()
  purchasePrice: string

  @Property()
  offerPrice: string

  @ManyToOne(() => User)
  @Index()
  agent: User

  @ManyToOne(() => User)
  @Index()
  user: User

  @ManyToOne(() => Flight)
  @Index()
  flight: Flight
}
