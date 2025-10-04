import { Migration } from '@mikro-orm/migrations';

export class Migration20250928151756 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table "tenant_entity" ("id" uuid not null default gen_random_uuid(), "create_at" timestamptz not null default current_timestamp, "update_at" timestamptz not null default current_timestamp, "deleted_at" timestamptz null, "delete_flag" boolean not null default false, "name" varchar(100) not null, "slug" varchar(50) not null, "description" varchar(500) null, "status" text check ("status" in ('ACTIVE', 'SUSPENDED', 'INACTIVE')) not null, "plan" text check ("plan" in ('FREE', 'BASIC', 'PREMIUM', 'ENTERPRISE')) not null, "logo_url" varchar(2048) null, "primary_color" varchar(7) null, "settings" jsonb null, "limits" jsonb null, "usage" jsonb null, "subscription_expires_at" timestamptz null, "is_active" boolean not null default true, constraint "tenant_entity_pkey" primary key ("id"));`);
    this.addSql(`alter table "tenant_entity" add constraint "tenant_entity_slug_unique" unique ("slug");`);
    this.addSql(`create index "tenant_entity_plan_index" on "tenant_entity" ("plan");`);
    this.addSql(`create index "tenant_entity_status_index" on "tenant_entity" ("status");`);
    this.addSql(`create index "tenant_entity_slug_index" on "tenant_entity" ("slug");`);
    this.addSql(`create index "tenant_entity_id_index" on "tenant_entity" ("id");`);

    this.addSql(`create table "tag_entity" ("id" uuid not null default gen_random_uuid(), "create_at" timestamptz not null default current_timestamp, "update_at" timestamptz not null default current_timestamp, "deleted_at" timestamptz null, "delete_flag" boolean not null default false, "name" varchar(100) not null, "description" varchar(500) null, "usage_count" int not null default 0, "color" varchar(50) null, "category" varchar(50) null, "is_active" boolean not null default true, "is_system" boolean not null default false, "author_id" varchar(255) null, "tenant_id" uuid not null, constraint "tag_entity_pkey" primary key ("id"));`);
    this.addSql(`alter table "tag_entity" add constraint "tag_entity_name_unique" unique ("name");`);
    this.addSql(`create index "tag_entity_usage_count_index" on "tag_entity" ("usage_count");`);
    this.addSql(`create index "tag_entity_tenant_id_delete_flag_index" on "tag_entity" ("tenant_id", "delete_flag");`);
    this.addSql(`create index "tag_entity_author_id_delete_flag_index" on "tag_entity" ("author_id", "delete_flag");`);
    this.addSql(`create index "tag_entity_name_index" on "tag_entity" ("name");`);
    this.addSql(`create index "tag_entity_id_index" on "tag_entity" ("id");`);

    this.addSql(`create table "bookmark_entity" ("id" uuid not null default gen_random_uuid(), "create_at" timestamptz not null default current_timestamp, "update_at" timestamptz not null default current_timestamp, "deleted_at" timestamptz null, "delete_flag" boolean not null default false, "url" varchar(2048) not null, "title" varchar(500) not null, "description" varchar(1000) null, "image_url" varchar(2048) null, "site_name" varchar(100) null, "content_type" varchar(50) null, "metadata" jsonb null, "tags" jsonb null, "notes" text null, "is_favorite" boolean not null default false, "is_active" boolean not null default true, "visit_count" int null, "last_visited_at" timestamptz null, "user_id" varchar(255) not null, "tenant_id" uuid not null, "collection_id" uuid null, constraint "bookmark_entity_pkey" primary key ("id"));`);
    this.addSql(`create index "bookmark_entity_collection_id_index" on "bookmark_entity" ("collection_id");`);
    this.addSql(`create index "bookmark_entity_title_index" on "bookmark_entity" ("title");`);
    this.addSql(`create index "bookmark_entity_url_index" on "bookmark_entity" ("url");`);
    this.addSql(`create index "bookmark_entity_tenant_id_delete_flag_index" on "bookmark_entity" ("tenant_id", "delete_flag");`);
    this.addSql(`create index "bookmark_entity_user_id_delete_flag_index" on "bookmark_entity" ("user_id", "delete_flag");`);
    this.addSql(`create index "bookmark_entity_id_index" on "bookmark_entity" ("id");`);

    this.addSql(`create table "bookmark_tag_entity" ("id" uuid not null default gen_random_uuid(), "create_at" timestamptz not null default current_timestamp, "update_at" timestamptz not null default current_timestamp, "deleted_at" timestamptz null, "delete_flag" boolean not null default false, "tenant_id" uuid not null, "bookmark_id" uuid not null, "tag_id" uuid not null, "added_by_id" varchar(255) not null, "notes" varchar(500) null, "is_auto_generated" boolean not null default false, "confidence" int null, constraint "bookmark_tag_entity_pkey" primary key ("id"));`);
    this.addSql(`create index "bookmark_tag_entity_tenant_id_delete_flag_index" on "bookmark_tag_entity" ("tenant_id", "delete_flag");`);
    this.addSql(`create index "bookmark_tag_entity_added_by_id_index" on "bookmark_tag_entity" ("added_by_id");`);
    this.addSql(`create index "bookmark_tag_entity_tag_id_index" on "bookmark_tag_entity" ("tag_id");`);
    this.addSql(`create index "bookmark_tag_entity_bookmark_id_index" on "bookmark_tag_entity" ("bookmark_id");`);
    this.addSql(`create index "bookmark_tag_entity_id_index" on "bookmark_tag_entity" ("id");`);
    this.addSql(`alter table "bookmark_tag_entity" add constraint "bookmark_tag_entity_bookmark_id_tag_id_unique" unique ("bookmark_id", "tag_id");`);

    this.addSql(`alter table "tag_entity" add constraint "tag_entity_author_id_foreign" foreign key ("author_id") references "user_entity" ("id") on update cascade on delete set null;`);
    this.addSql(`alter table "tag_entity" add constraint "tag_entity_tenant_id_foreign" foreign key ("tenant_id") references "tenant_entity" ("id") on update cascade;`);

    this.addSql(`alter table "bookmark_entity" add constraint "bookmark_entity_user_id_foreign" foreign key ("user_id") references "user_entity" ("id") on update cascade;`);
    this.addSql(`alter table "bookmark_entity" add constraint "bookmark_entity_tenant_id_foreign" foreign key ("tenant_id") references "tenant_entity" ("id") on update cascade;`);
    this.addSql(`alter table "bookmark_entity" add constraint "bookmark_entity_collection_id_foreign" foreign key ("collection_id") references "collection_entity" ("id") on update cascade on delete set null;`);

    this.addSql(`alter table "bookmark_tag_entity" add constraint "bookmark_tag_entity_tenant_id_foreign" foreign key ("tenant_id") references "tenant_entity" ("id") on update cascade;`);
    this.addSql(`alter table "bookmark_tag_entity" add constraint "bookmark_tag_entity_bookmark_id_foreign" foreign key ("bookmark_id") references "bookmark_entity" ("id") on update cascade on delete cascade;`);
    this.addSql(`alter table "bookmark_tag_entity" add constraint "bookmark_tag_entity_tag_id_foreign" foreign key ("tag_id") references "tag_entity" ("id") on update cascade on delete cascade;`);
    this.addSql(`alter table "bookmark_tag_entity" add constraint "bookmark_tag_entity_added_by_id_foreign" foreign key ("added_by_id") references "user_entity" ("id") on update cascade;`);

    this.addSql(`alter table "account_entity" drop constraint "account_entity_user_id_foreign";`);

    this.addSql(`alter table "user_entity" add column "tenant_id" uuid not null;`);
    this.addSql(`alter table "user_entity" add constraint "user_entity_tenant_id_foreign" foreign key ("tenant_id") references "tenant_entity" ("id") on update cascade;`);

    this.addSql(`drop index "crawl_entity_id_index";`);

    this.addSql(`alter table "crawl_entity" add column "tenant_id" uuid not null;`);
    this.addSql(`alter table "crawl_entity" add constraint "crawl_entity_tenant_id_foreign" foreign key ("tenant_id") references "tenant_entity" ("id") on update cascade;`);
    this.addSql(`create index "crawl_entity_tenant_id_delete_flag_index" on "crawl_entity" ("tenant_id", "delete_flag");`);

    this.addSql(`alter table "collection_entity" add column "tenant_id" uuid not null;`);
    this.addSql(`alter table "collection_entity" add constraint "collection_entity_tenant_id_foreign" foreign key ("tenant_id") references "tenant_entity" ("id") on update cascade;`);
    this.addSql(`create index "collection_entity_tenant_id_delete_flag_index" on "collection_entity" ("tenant_id", "delete_flag");`);

    this.addSql(`alter table "account_entity" add column "tenant_id" uuid not null;`);
    this.addSql(`alter table "account_entity" alter column "user_id" type varchar(255) using ("user_id"::varchar(255));`);
    this.addSql(`alter table "account_entity" alter column "user_id" set not null;`);
    this.addSql(`alter table "account_entity" add constraint "account_entity_tenant_id_foreign" foreign key ("tenant_id") references "tenant_entity" ("id") on update cascade;`);
    this.addSql(`alter table "account_entity" add constraint "account_entity_user_id_foreign" foreign key ("user_id") references "user_entity" ("id") on update cascade on delete cascade;`);

    this.addSql(`alter table "session_entity" add column "tenant_id" uuid not null;`);
    this.addSql(`alter table "session_entity" add constraint "session_entity_tenant_id_foreign" foreign key ("tenant_id") references "tenant_entity" ("id") on update cascade;`);
    this.addSql(`create index "session_entity_tenant_id_is_active_index" on "session_entity" ("tenant_id", "is_active");`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "user_entity" drop constraint "user_entity_tenant_id_foreign";`);

    this.addSql(`alter table "tag_entity" drop constraint "tag_entity_tenant_id_foreign";`);

    this.addSql(`alter table "crawl_entity" drop constraint "crawl_entity_tenant_id_foreign";`);

    this.addSql(`alter table "collection_entity" drop constraint "collection_entity_tenant_id_foreign";`);

    this.addSql(`alter table "bookmark_entity" drop constraint "bookmark_entity_tenant_id_foreign";`);

    this.addSql(`alter table "bookmark_tag_entity" drop constraint "bookmark_tag_entity_tenant_id_foreign";`);

    this.addSql(`alter table "account_entity" drop constraint "account_entity_tenant_id_foreign";`);

    this.addSql(`alter table "session_entity" drop constraint "session_entity_tenant_id_foreign";`);

    this.addSql(`alter table "bookmark_tag_entity" drop constraint "bookmark_tag_entity_tag_id_foreign";`);

    this.addSql(`alter table "bookmark_tag_entity" drop constraint "bookmark_tag_entity_bookmark_id_foreign";`);

    this.addSql(`drop table if exists "tenant_entity" cascade;`);

    this.addSql(`drop table if exists "tag_entity" cascade;`);

    this.addSql(`drop table if exists "bookmark_entity" cascade;`);

    this.addSql(`drop table if exists "bookmark_tag_entity" cascade;`);

    this.addSql(`alter table "account_entity" drop constraint "account_entity_user_id_foreign";`);

    this.addSql(`alter table "user_entity" drop column "tenant_id";`);

    this.addSql(`drop index "crawl_entity_tenant_id_delete_flag_index";`);
    this.addSql(`alter table "crawl_entity" drop column "tenant_id";`);

    this.addSql(`create index "crawl_entity_id_index" on "crawl_entity" ("id");`);

    this.addSql(`drop index "collection_entity_tenant_id_delete_flag_index";`);
    this.addSql(`alter table "collection_entity" drop column "tenant_id";`);

    this.addSql(`alter table "account_entity" drop column "tenant_id";`);

    this.addSql(`alter table "account_entity" alter column "user_id" type varchar(255) using ("user_id"::varchar(255));`);
    this.addSql(`alter table "account_entity" alter column "user_id" drop not null;`);
    this.addSql(`alter table "account_entity" add constraint "account_entity_user_id_foreign" foreign key ("user_id") references "user_entity" ("id") on delete cascade;`);

    this.addSql(`drop index "session_entity_tenant_id_is_active_index";`);
    this.addSql(`alter table "session_entity" drop column "tenant_id";`);
  }

}
