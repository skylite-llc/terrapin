import {
  Entity,
  PrimaryKey,
  Property,
  OneToMany,
  Collection,
  Index,
} from '@mikro-orm/core'
import Aircraft from '@models/Aircraft/Aircraft.entity'

@Entity()
export default class AircraftCategory {
  @PrimaryKey()
  id: string

  @Property({ onCreate: () => new Date() })
  createdAt: Date

  @Property({ onUpdate: () => new Date() })
  modifiedAt: Date

  @OneToMany(() => Aircraft, aircraft => aircraft.aircraftCategory)
  @Index()
  aircraft = new Collection<Aircraft>(this)
}
