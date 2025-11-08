import { Migration } from '@mikro-orm/migrations';

export class Migration20251107215114 extends Migration {
  override async up(): Promise<void> {
    // Add faviconUrl column to bookmark_entity table
    this.addSql(
      `alter table "bookmark_entity" add column "favicon_url" varchar(2048) null;`,
    );

    // Add composite index for duplicate URL detection (user_id + url)
    this.addSql(
      `create index "bookmark_entity_user_id_url_index" on "bookmark_entity" ("user_id", "url");`,
    );
  }

  override async down(): Promise<void> {
    // Remove composite index
    this.addSql(
      `drop index if exists "bookmark_entity_user_id_url_index";`,
    );

    // Remove faviconUrl column
    this.addSql(
      `alter table "bookmark_entity" drop column if exists "favicon_url";`,
    );
  }
}

