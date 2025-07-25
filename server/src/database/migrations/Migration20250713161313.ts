import { Migration } from '@mikro-orm/migrations';

export class Migration20250713161313 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table "users" ("id" uuid not null default gen_random_uuid(), "create_at" timestamptz not null default current_timestamp, "update_at" timestamptz not null default current_timestamp, "first_name" varchar(255) not null, "last_name" varchar(255) not null, "username" varchar(255) not null, "password_hash" varchar(255) not null, "email" varchar(255) null, "refresh_token" varchar(255) null, constraint "users_pkey" primary key ("id"));`);
    this.addSql(`alter table "users" add constraint "users_username_unique" unique ("username");`);
    this.addSql(`alter table "users" add constraint "users_email_unique" unique ("email");`);

    this.addSql(`create table "collection" ("id" uuid not null default gen_random_uuid(), "create_at" timestamptz not null default current_timestamp, "update_at" timestamptz not null default current_timestamp, "title" varchar(255) not null, "left" int not null, "right" int not null, "depth" int not null, "position" varchar(255) not null, "tree_id" varchar(255) not null, "parent_id" uuid null, "user_id" uuid not null, constraint "collection_pkey" primary key ("id"), constraint collection_check check ("left" > 0 AND "right" > "left"));`);

    this.addSql(`create table "tag" ("id" uuid not null default gen_random_uuid(), "create_at" timestamptz not null default current_timestamp, "update_at" timestamptz not null default current_timestamp, "title" varchar(255) not null, "collection_id" uuid not null, constraint "tag_pkey" primary key ("id"));`);

    this.addSql(`create table "bookmarks" ("id" uuid not null default gen_random_uuid(), "create_at" timestamptz not null default current_timestamp, "update_at" timestamptz not null default current_timestamp, "url" varchar(255) not null, "title" varchar(255) not null, "domain" varchar(255) null, "image" varchar(255) null, "description" text null, "favicon" varchar(255) null, "note" varchar(255) null, "collection_id" uuid not null, constraint "bookmarks_pkey" primary key ("id"));`);

    this.addSql(`create table "bookmarks_tags" ("bookmark_entity_id" uuid not null, "tag_entity_id" uuid not null, constraint "bookmarks_tags_pkey" primary key ("bookmark_entity_id", "tag_entity_id"));`);

    this.addSql(`alter table "collection" add constraint "collection_parent_id_foreign" foreign key ("parent_id") references "collection" ("id") on update cascade on delete set null;`);
    this.addSql(`alter table "collection" add constraint "collection_user_id_foreign" foreign key ("user_id") references "users" ("id") on update cascade;`);

    this.addSql(`alter table "tag" add constraint "tag_collection_id_foreign" foreign key ("collection_id") references "collection" ("id") on update cascade;`);

    this.addSql(`alter table "bookmarks" add constraint "bookmarks_collection_id_foreign" foreign key ("collection_id") references "collection" ("id") on update cascade;`);

    this.addSql(`alter table "bookmarks_tags" add constraint "bookmarks_tags_bookmark_entity_id_foreign" foreign key ("bookmark_entity_id") references "bookmarks" ("id") on update cascade on delete cascade;`);
    this.addSql(`alter table "bookmarks_tags" add constraint "bookmarks_tags_tag_entity_id_foreign" foreign key ("tag_entity_id") references "tag" ("id") on update cascade on delete cascade;`);
  }

}
