import { Migration } from "@mikro-orm/migrations";

export class Migration20240406053508 extends Migration {
  async up(): Promise<void> {
    this.addSql(
      'create table "collection" ("id" uuid not null default uuid_generate_v4(), "create_at" timestamptz not null default current_timestamp, "update_at" timestamptz not null default current_timestamp, "title" varchar(255) not null, "left" int not null, "right" int not null, "depth" int not null, "position" varchar(255) not null, "tree_id" varchar(255) not null, "parent_id" uuid null, "user_id" uuid not null, constraint "collection_pkey" primary key ("id"), constraint collection_check check ("left" > 0 AND "right" > "left"));'
    );

    this.addSql(
      'alter table "collection" add constraint "collection_parent_id_foreign" foreign key ("parent_id") references "collection" ("id") on update cascade on delete set null;'
    );
    this.addSql(
      'alter table "collection" add constraint "collection_user_id_foreign" foreign key ("user_id") references "users" ("id") on update cascade;'
    );

    this.addSql(
      'alter table "users" alter column "create_at" type timestamptz using ("create_at"::timestamptz);'
    );
    this.addSql(
      'alter table "users" alter column "update_at" type timestamptz using ("update_at"::timestamptz);'
    );
  }

  async down(): Promise<void> {
    this.addSql(
      'alter table "users" alter column "create_at" type timestamptz(0) using ("create_at"::timestamptz(0));'
    );
    this.addSql(
      'alter table "users" alter column "update_at" type timestamptz(0) using ("update_at"::timestamptz(0));'
    );
  }
}
