import { Migration } from '@mikro-orm/migrations';

export class Migration20251108035245 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table "bookmark_entity" add column "favicon_url" varchar(2048) null;`);
    this.addSql(`create index "bookmark_entity_user_id_url_index" on "bookmark_entity" ("user_id", "url");`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop index "bookmark_entity_user_id_url_index";`);
    this.addSql(`alter table "bookmark_entity" drop column "favicon_url";`);
  }

}
