import { Migration } from '@mikro-orm/migrations';

export class Migration20250914074700 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table "crawl_entity" ("id" uuid not null default gen_random_uuid(), "create_at" timestamptz not null default current_timestamp, "update_at" timestamptz not null default current_timestamp, "deleted_at" timestamptz null, "delete_flag" boolean not null default false, "url" varchar(2048) not null, "status" text check ("status" in ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'TIMEOUT')) not null, "crawl_type" text check ("crawl_type" in ('METADATA', 'FULL_CONTENT', 'SCREENSHOT')) not null, "title" varchar(500) null, "description" varchar(1000) null, "image_url" varchar(2048) null, "site_name" varchar(100) null, "content_type" varchar(50) null, "content_length" int null, "metadata" jsonb null, "content" text null, "screenshot_url" varchar(2048) null, "crawl_duration" int null, "error_message" varchar(1000) null, "retry_count" int null, "last_crawled_at" timestamptz null, "expires_at" timestamptz null, "is_active" boolean not null default true, "user_id" varchar(255) not null, constraint "crawl_entity_pkey" primary key ("id"));`);
    this.addSql(`create index "crawl_entity_crawl_type_index" on "crawl_entity" ("crawl_type");`);
    this.addSql(`create index "crawl_entity_status_index" on "crawl_entity" ("status");`);
    this.addSql(`create index "crawl_entity_url_index" on "crawl_entity" ("url");`);
    this.addSql(`create index "crawl_entity_user_id_delete_flag_index" on "crawl_entity" ("user_id", "delete_flag");`);
    this.addSql(`create index "crawl_entity_id_index" on "crawl_entity" ("id");`);

    this.addSql(`create table "collection_entity" ("id" uuid not null default gen_random_uuid(), "create_at" timestamptz not null default current_timestamp, "update_at" timestamptz not null default current_timestamp, "deleted_at" timestamptz null, "delete_flag" boolean not null default false, "name" varchar(255) not null, "icon" varchar(100) null, "path" varchar(500) not null, "is_has_child" boolean not null default false, "description" varchar(1000) null, "sort_order" int not null default 0, "is_active" boolean not null default true, "user_id" varchar(255) not null, "parent_id" uuid null, constraint "collection_entity_pkey" primary key ("id"));`);
    this.addSql(`create index "collection_entity_parent_id_index" on "collection_entity" ("parent_id");`);
    this.addSql(`create index "collection_entity_user_id_delete_flag_index" on "collection_entity" ("user_id", "delete_flag");`);
    this.addSql(`create index "collection_entity_id_index" on "collection_entity" ("id");`);

    this.addSql(`alter table "crawl_entity" add constraint "crawl_entity_user_id_foreign" foreign key ("user_id") references "user_entity" ("id") on update cascade;`);

    this.addSql(`alter table "collection_entity" add constraint "collection_entity_user_id_foreign" foreign key ("user_id") references "user_entity" ("id") on update cascade;`);
    this.addSql(`alter table "collection_entity" add constraint "collection_entity_parent_id_foreign" foreign key ("parent_id") references "collection_entity" ("id") on update cascade on delete set null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "collection_entity" drop constraint "collection_entity_parent_id_foreign";`);

    this.addSql(`drop table if exists "crawl_entity" cascade;`);

    this.addSql(`drop table if exists "collection_entity" cascade;`);
  }

}
