import { Migration } from '@mikro-orm/migrations';

export class Migration20241112123317 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table "aircraft_categories" ("id" varchar(255) not null, "created_at" timestamptz not null, "modified_at" timestamptz not null, constraint "aircraft_categories_pkey" primary key ("id"));`);

    this.addSql(`create table "flights" ("id" varchar(255) not null, "created_at" timestamptz not null, "modified_at" timestamptz not null, "departure_time" varchar(255) not null, "arrival_time" varchar(255) not null, "origin_id" varchar(255) not null, "destination_id" varchar(255) not null, "aircraft_id" varchar(255) not null, constraint "flights_pkey" primary key ("id"));`);
    this.addSql(`create index "flights_origin_id_index" on "flights" ("origin_id");`);
    this.addSql(`create index "flights_destination_id_index" on "flights" ("destination_id");`);
    this.addSql(`create index "flights_aircraft_id_index" on "flights" ("aircraft_id");`);

    this.addSql(`create table "airports" ("id" varchar(255) not null, "created_at" timestamptz not null, "modified_at" timestamptz not null, "flight_id" varchar(255) not null, constraint "airports_pkey" primary key ("id"));`);
    this.addSql(`create index "airports_flight_id_index" on "airports" ("flight_id");`);

    this.addSql(`create table "aircraft" ("id" varchar(255) not null, "created_at" timestamptz not null, "modified_at" timestamptz not null, "tail_number" varchar(255) not null, "aircraft_category_id" varchar(255) not null, "airport_id" varchar(255) not null, constraint "aircraft_pkey" primary key ("id"));`);
    this.addSql(`create index "aircraft_aircraft_category_id_index" on "aircraft" ("aircraft_category_id");`);
    this.addSql(`create index "aircraft_airport_id_index" on "aircraft" ("airport_id");`);

    this.addSql(`create table "roles" ("id" varchar(255) not null, "created_at" timestamptz not null, "modified_at" timestamptz not null, "name" varchar(255) not null, constraint "roles_pkey" primary key ("id"));`);

    this.addSql(`create table "user_profiles" ("id" varchar(255) not null, "created_at" timestamptz not null, "modified_at" timestamptz not null, "date_of_birth" varchar(255) not null, constraint "user_profiles_pkey" primary key ("id"));`);

    this.addSql(`create table "users" ("id" varchar(255) not null, "created_at" timestamptz not null, "modified_at" timestamptz not null, "display_name" varchar(255) not null, "email" varchar(255) not null, "phone" varchar(255) not null, "user_profile_id" varchar(255) not null, constraint "users_pkey" primary key ("id"));`);
    this.addSql(`create index "users_user_profile_id_index" on "users" ("user_profile_id");`);
    this.addSql(`alter table "users" add constraint "users_user_profile_id_unique" unique ("user_profile_id");`);

    this.addSql(`create table "bookings" ("id" varchar(255) not null, "created_at" timestamptz not null, "modified_at" timestamptz not null, "purchase_price" varchar(255) not null, "offer_price" varchar(255) not null, "agent_id" varchar(255) not null, "user_id" varchar(255) not null, "flight_id" varchar(255) not null, constraint "bookings_pkey" primary key ("id"));`);
    this.addSql(`create index "bookings_agent_id_index" on "bookings" ("agent_id");`);
    this.addSql(`create index "bookings_user_id_index" on "bookings" ("user_id");`);
    this.addSql(`create index "bookings_flight_id_index" on "bookings" ("flight_id");`);

    this.addSql(`create table "users_roles" ("user_id" varchar(255) not null, "role_id" varchar(255) not null, constraint "users_roles_pkey" primary key ("user_id", "role_id"));`);

    this.addSql(`alter table "flights" add constraint "flights_origin_id_foreign" foreign key ("origin_id") references "airports" ("id") on update cascade;`);
    this.addSql(`alter table "flights" add constraint "flights_destination_id_foreign" foreign key ("destination_id") references "airports" ("id") on update cascade;`);
    this.addSql(`alter table "flights" add constraint "flights_aircraft_id_foreign" foreign key ("aircraft_id") references "aircraft" ("id") on update cascade;`);

    this.addSql(`alter table "airports" add constraint "airports_flight_id_foreign" foreign key ("flight_id") references "flights" ("id") on update cascade;`);

    this.addSql(`alter table "aircraft" add constraint "aircraft_aircraft_category_id_foreign" foreign key ("aircraft_category_id") references "aircraft_categories" ("id") on update cascade;`);
    this.addSql(`alter table "aircraft" add constraint "aircraft_airport_id_foreign" foreign key ("airport_id") references "airports" ("id") on update cascade;`);

    this.addSql(`alter table "users" add constraint "users_user_profile_id_foreign" foreign key ("user_profile_id") references "user_profiles" ("id") on update cascade;`);

    this.addSql(`alter table "bookings" add constraint "bookings_agent_id_foreign" foreign key ("agent_id") references "users" ("id") on update cascade;`);
    this.addSql(`alter table "bookings" add constraint "bookings_user_id_foreign" foreign key ("user_id") references "users" ("id") on update cascade;`);
    this.addSql(`alter table "bookings" add constraint "bookings_flight_id_foreign" foreign key ("flight_id") references "flights" ("id") on update cascade;`);

    this.addSql(`alter table "users_roles" add constraint "users_roles_user_id_foreign" foreign key ("user_id") references "users" ("id") on update cascade on delete cascade;`);
    this.addSql(`alter table "users_roles" add constraint "users_roles_role_id_foreign" foreign key ("role_id") references "roles" ("id") on update cascade on delete cascade;`);

    this.addSql(`drop table if exists "users_flights" cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "aircraft" drop constraint "aircraft_aircraft_category_id_foreign";`);

    this.addSql(`alter table "airports" drop constraint "airports_flight_id_foreign";`);

    this.addSql(`alter table "bookings" drop constraint "bookings_flight_id_foreign";`);

    this.addSql(`alter table "flights" drop constraint "flights_origin_id_foreign";`);

    this.addSql(`alter table "flights" drop constraint "flights_destination_id_foreign";`);

    this.addSql(`alter table "aircraft" drop constraint "aircraft_airport_id_foreign";`);

    this.addSql(`alter table "flights" drop constraint "flights_aircraft_id_foreign";`);

    this.addSql(`alter table "users_roles" drop constraint "users_roles_role_id_foreign";`);

    this.addSql(`alter table "users" drop constraint "users_user_profile_id_foreign";`);

    this.addSql(`alter table "bookings" drop constraint "bookings_agent_id_foreign";`);

    this.addSql(`alter table "bookings" drop constraint "bookings_user_id_foreign";`);

    this.addSql(`alter table "users_roles" drop constraint "users_roles_user_id_foreign";`);

    this.addSql(`create table "users_flights" ("user_id" varchar(255) not null, "flight_id" varchar(255) not null, constraint "users_flights_pkey" primary key ("user_id", "flight_id"));`);

    this.addSql(`drop table if exists "aircraft_categories" cascade;`);

    this.addSql(`drop table if exists "flights" cascade;`);

    this.addSql(`drop table if exists "airports" cascade;`);

    this.addSql(`drop table if exists "aircraft" cascade;`);

    this.addSql(`drop table if exists "roles" cascade;`);

    this.addSql(`drop table if exists "user_profiles" cascade;`);

    this.addSql(`drop table if exists "users" cascade;`);

    this.addSql(`drop table if exists "bookings" cascade;`);

    this.addSql(`drop table if exists "users_roles" cascade;`);
  }

}
