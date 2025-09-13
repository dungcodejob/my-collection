import { Migration } from '@mikro-orm/migrations';

export class Migration20250828024818 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table "session_entity" add column "device_id" varchar(255) not null, add column "refresh_count" int not null default 0, add column "user_id" varchar(255) not null;`);
    this.addSql(`alter table "session_entity" alter column "expires_at" type timestamptz using ("expires_at"::timestamptz);`);
    this.addSql(`alter table "session_entity" alter column "expires_at" drop not null;`);
    this.addSql(`alter table "session_entity" alter column "refresh_token_hash" type varchar(255) using ("refresh_token_hash"::varchar(255));`);
    this.addSql(`alter table "session_entity" alter column "refresh_token_hash" drop not null;`);
    this.addSql(`alter table "session_entity" add constraint "session_entity_user_id_foreign" foreign key ("user_id") references "user_entity" ("id") on update cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "session_entity" drop constraint "session_entity_user_id_foreign";`);

    this.addSql(`alter table "session_entity" drop column "device_id", drop column "refresh_count", drop column "user_id";`);

    this.addSql(`alter table "session_entity" alter column "expires_at" type timestamptz using ("expires_at"::timestamptz);`);
    this.addSql(`alter table "session_entity" alter column "expires_at" set not null;`);
    this.addSql(`alter table "session_entity" alter column "refresh_token_hash" type varchar(255) using ("refresh_token_hash"::varchar(255));`);
    this.addSql(`alter table "session_entity" alter column "refresh_token_hash" set not null;`);
  }

}
