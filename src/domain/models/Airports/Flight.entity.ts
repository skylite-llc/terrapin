import {
  OneToMany,
  Collection,
  Entity,
  PrimaryKey,
  Property,
  ManyToOne,
  Index,
} from '@mikro-orm/core'
import Aircraft from '@models//Aircraft/Aircraft.entity'
import Airport from '@models/Airports/Airport.entity'
import Booking from '@models/Users/Booking.entity'

@Entity()
export default class Flight {
  @PrimaryKey()
  id: string

  @Property({ onCreate: () => new Date() })
  createdAt: Date

  @Property({ onUpdate: () => new Date() })
  modifiedAt: Date

  @Property()
  departureTime: string

  @Property()
  arrivalTime: string

  @ManyToOne(() => Airport)
  @Index()
  origin: Airport

  @ManyToOne(() => Airport)
  @Index()
  destination: Airport

  @ManyToOne(() => Aircraft)
  @Index()
  aircraft: Aircraft

  @OneToMany(() => Booking, booking => booking.flight)
  @Index()
  bookings = new Collection<Booking>(this)
}
