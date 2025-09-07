import { Migration } from '@mikro-orm/migrations';

export class Migration20250825223003 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table "account" drop constraint "account_user_id_foreign";`);

    this.addSql(`create table "user_entity" ("id" varchar(255) not null, "create_at" timestamptz not null default current_timestamp, "update_at" timestamptz not null default current_timestamp, "deleted_at" timestamptz null, "delete_flag" boolean not null default false, "name" varchar(255) not null, "role" text check ("role" in ('USER', 'ADMIN')) not null, constraint "user_entity_pkey" primary key ("id"));`);

    this.addSql(`create table "account_entity" ("id" uuid not null default gen_random_uuid(), "create_at" timestamptz not null default current_timestamp, "update_at" timestamptz not null default current_timestamp, "deleted_at" timestamptz null, "delete_flag" boolean not null default false, "username" varchar(255) not null, "email" varchar(255) not null, "password_hash" varchar(255) not null, "version" int not null, "password_updated_at" timestamptz not null default CURRENT_TIMESTAMP, "is_active" boolean not null default true, "last_login_at" timestamptz null, "user_id" varchar(255) null, constraint "account_entity_pkey" primary key ("id"));`);
    this.addSql(`alter table "account_entity" add constraint "account_entity_username_unique" unique ("username");`);
    this.addSql(`alter table "account_entity" add constraint "account_entity_email_unique" unique ("email");`);

    this.addSql(`alter table "account_entity" add constraint "account_entity_user_id_foreign" foreign key ("user_id") references "user_entity" ("id") on delete cascade;`);

    this.addSql(`drop table if exists "user" cascade;`);

    this.addSql(`drop table if exists "account" cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "account_entity" drop constraint "account_entity_user_id_foreign";`);

    this.addSql(`create table "user" ("id" varchar(255) not null, "name" varchar(255) not null, "role" text check ("role" in ('USER', 'ADMIN')) not null, "created_at" timestamptz not null default CURRENT_TIMESTAMP, "updated_at" timestamptz not null, constraint "user_pkey" primary key ("id"));`);

    this.addSql(`create table "account" ("id" uuid not null default gen_random_uuid(), "create_at" timestamptz not null default current_timestamp, "update_at" timestamptz not null default current_timestamp, "deleted_at" timestamptz null, "delete_flag" boolean not null default false, "username" varchar(255) not null, "email" varchar(255) not null, "password_hash" varchar(255) not null, "version" int not null, "password_updated_at" timestamptz not null default CURRENT_TIMESTAMP, "is_active" boolean not null default true, "last_login_at" timestamptz null, "user_id" varchar(255) null, constraint "account_pkey" primary key ("id"));`);
    this.addSql(`alter table "account" add constraint "account_username_unique" unique ("username");`);
    this.addSql(`alter table "account" add constraint "account_email_unique" unique ("email");`);

    this.addSql(`alter table "account" add constraint "account_user_id_foreign" foreign key ("user_id") references "user" ("id") on delete cascade;`);

    this.addSql(`drop table if exists "user_entity" cascade;`);

    this.addSql(`drop table if exists "account_entity" cascade;`);
  }

}
