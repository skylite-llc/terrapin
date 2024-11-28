import {
  Entity,
  PrimaryKey,
  Property,
  ManyToOne,
  Index,
  OneToMany,
  Collection,
} from '@mikro-orm/core'
import Aircraft from '@models//Aircraft/Aircraft.entity'
import Flight from '@models/Airports/Flight.entity'

@Entity()
export default class Airport {
  @PrimaryKey()
  id: string

  @Property({ onCreate: () => new Date() })
  createdAt: Date

  @Property({ onUpdate: () => new Date() })
  modifiedAt: Date

  @ManyToOne(() => Flight)
  @Index()
  flights: Flight

  @OneToMany(() => Aircraft, aircraft => aircraft.airport)
  @Index()
  aircraft = new Collection<Aircraft>(this)

  @OneToMany(() => Flight, flight => flight.origin)
  @Index()
  departing_flights = new Collection<Flight>(this)

  @OneToMany(() => Flight, flight => flight.destination)
  @Index()
  arriving_flights = new Collection<Flight>(this)
}
