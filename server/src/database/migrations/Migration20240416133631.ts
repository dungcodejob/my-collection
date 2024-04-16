import { Migration } from '@mikro-orm/migrations';

export class Migration20240416133631 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table "tag" ("id" uuid not null default uuid_generate_v4(), "create_at" timestamptz not null default current_timestamp, "update_at" timestamptz not null default current_timestamp, "title" varchar(255) not null, "collection_id" uuid not null, constraint "tag_pkey" primary key ("id"));');

    this.addSql('create table "bookmarks_tags" ("bookmark_entity_id" uuid not null, "tag_entity_id" uuid not null, constraint "bookmarks_tags_pkey" primary key ("bookmark_entity_id", "tag_entity_id"));');

    this.addSql('alter table "tag" add constraint "tag_collection_id_foreign" foreign key ("collection_id") references "collection" ("id") on update cascade;');

    this.addSql('alter table "bookmarks_tags" add constraint "bookmarks_tags_bookmark_entity_id_foreign" foreign key ("bookmark_entity_id") references "bookmarks" ("id") on update cascade on delete cascade;');
    this.addSql('alter table "bookmarks_tags" add constraint "bookmarks_tags_tag_entity_id_foreign" foreign key ("tag_entity_id") references "tag" ("id") on update cascade on delete cascade;');
  }

}
