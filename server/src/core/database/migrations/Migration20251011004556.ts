import { Migration } from '@mikro-orm/migrations';

export class Migration20251011004556 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `alter table "collection_entity" add column "slug" varchar(50) not null;`,
    );
    this.addSql(
      `alter table "collection_entity" add constraint "collection_entity_tenant_id_slug_unique" unique ("tenant_id", "slug");`,
    );
  }

  override async down(): Promise<void> {
    this.addSql(
      `alter table "collection_entity" drop constraint "collection_entity_tenant_id_slug_unique";`,
    );
    this.addSql(`alter table "collection_entity" drop column "slug";`);
  }
}
