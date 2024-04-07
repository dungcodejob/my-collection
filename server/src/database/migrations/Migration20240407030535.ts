import { Migration } from '@mikro-orm/migrations';

export class Migration20240407030535 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table "bookmarks" ("id" uuid not null default uuid_generate_v4(), "create_at" timestamptz not null default current_timestamp, "update_at" timestamptz not null default current_timestamp, "url" varchar(255) not null, "title" varchar(255) not null, "domain" varchar(255) null, "image" varchar(255) null, "description" text null, "favicon" varchar(255) null, "note" varchar(255) null, "collection_id" uuid not null, constraint "bookmarks_pkey" primary key ("id"));');

    this.addSql('alter table "bookmarks" add constraint "bookmarks_collection_id_foreign" foreign key ("collection_id") references "collection" ("id") on update cascade;');
  }

}
