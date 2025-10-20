import { Migration } from '@mikro-orm/migrations';

export class Migration20251020162801 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `create unique index "collection_entity_tenant_id_slug_unique" on "collection_entity" ("tenant_id", "slug") where delete_flag = false;;`,
    );
  }

  override async down(): Promise<void> {
    this.addSql(
      ` drop index if exists "collection_entity_tenant_id_slug_unique";`,
    );
  }
}
