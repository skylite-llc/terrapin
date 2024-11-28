import {
  OneToMany,
  Collection,
  ManyToOne,
  Index,
  Entity,
  PrimaryKey,
  Property,
} from '@mikro-orm/core'
import AircraftCategory from '@models/Aircraft/AircraftCategory.entity'
import Airport from '@models/Airports/Airport.entity'
import Flight from '@models/Airports/Flight.entity'

@Entity()
export default class Aircraft {
  @PrimaryKey()
  id: string

  @Property({ onCreate: () => new Date() })
  createdAt: Date

  @Property({ onUpdate: () => new Date() })
  modifiedAt: Date

  @Property()
  tailNumber: string

  @ManyToOne(() => AircraftCategory)
  @Index()
  aircraftCategory: AircraftCategory

  @OneToMany(() => Flight, flight => flight.aircraft)
  @Index()
  flights = new Collection<Flight>(this)

  @ManyToOne(() => Airport)
  @Index()
  airport: Airport
}
