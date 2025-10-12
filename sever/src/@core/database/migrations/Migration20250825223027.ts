import { Migration } from '@mikro-orm/migrations';

export class Migration20250825223027 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `create table "session_entity" ("id" uuid not null default gen_random_uuid(), "create_at" timestamptz not null default current_timestamp, "update_at" timestamptz not null default current_timestamp, "deleted_at" timestamptz null, "delete_flag" boolean not null default false, "expires_at" timestamptz not null, "last_accessed_at" timestamptz not null default CURRENT_TIMESTAMP, "is_active" boolean not null default true, "refresh_token_hash" varchar(255) not null, "ip_address" varchar(45) null, "user_agent" varchar(500) null, "device_type" varchar(100) null, "location" varchar(100) null, "account_id" uuid not null, constraint "session_entity_pkey" primary key ("id"));`,
    );
    this.addSql(
      `create index "session_entity_account_id_is_active_index" on "session_entity" ("account_id", "is_active");`,
    );
    this.addSql(
      `create index "session_entity_id_index" on "session_entity" ("id");`,
    );

    this.addSql(
      `alter table "session_entity" add constraint "session_entity_account_id_foreign" foreign key ("account_id") references "account_entity" ("id") on update cascade;`,
    );
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "session_entity" cascade;`);
  }
}
