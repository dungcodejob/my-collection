import { Migration } from '@mikro-orm/migrations';

export class Migration20250928152109 extends Migration {
  override async up(): Promise<void> {
    this.addSql(`alter table "tenant_entity" alter column "id" drop default;`);
    this.addSql(
      `alter table "tenant_entity" alter column "id" type uuid using ("id"::text::uuid);`,
    );
    this.addSql(
      `alter table "tenant_entity" alter column "id" set default uuidv7();`,
    );

    this.addSql(`alter table "tag_entity" alter column "id" drop default;`);
    this.addSql(
      `alter table "tag_entity" alter column "id" type uuid using ("id"::text::uuid);`,
    );
    this.addSql(
      `alter table "tag_entity" alter column "id" set default uuidv7();`,
    );

    this.addSql(`alter table "crawl_entity" alter column "id" drop default;`);
    this.addSql(
      `alter table "crawl_entity" alter column "id" type uuid using ("id"::text::uuid);`,
    );
    this.addSql(
      `alter table "crawl_entity" alter column "id" set default uuidv7();`,
    );

    this.addSql(
      `alter table "collection_entity" alter column "id" drop default;`,
    );
    this.addSql(
      `alter table "collection_entity" alter column "id" type uuid using ("id"::text::uuid);`,
    );
    this.addSql(
      `alter table "collection_entity" alter column "id" set default uuidv7();`,
    );

    this.addSql(
      `alter table "bookmark_entity" alter column "id" drop default;`,
    );
    this.addSql(
      `alter table "bookmark_entity" alter column "id" type uuid using ("id"::text::uuid);`,
    );
    this.addSql(
      `alter table "bookmark_entity" alter column "id" set default uuidv7();`,
    );

    this.addSql(
      `alter table "bookmark_tag_entity" alter column "id" drop default;`,
    );
    this.addSql(
      `alter table "bookmark_tag_entity" alter column "id" type uuid using ("id"::text::uuid);`,
    );
    this.addSql(
      `alter table "bookmark_tag_entity" alter column "id" set default uuidv7();`,
    );

    this.addSql(`alter table "account_entity" alter column "id" drop default;`);
    this.addSql(
      `alter table "account_entity" alter column "id" type uuid using ("id"::text::uuid);`,
    );
    this.addSql(
      `alter table "account_entity" alter column "id" set default uuidv7();`,
    );

    this.addSql(`alter table "session_entity" alter column "id" drop default;`);
    this.addSql(
      `alter table "session_entity" alter column "id" type uuid using ("id"::text::uuid);`,
    );
    this.addSql(
      `alter table "session_entity" alter column "id" set default uuidv7();`,
    );
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "tenant_entity" alter column "id" drop default;`);
    this.addSql(
      `alter table "tenant_entity" alter column "id" type uuid using ("id"::text::uuid);`,
    );
    this.addSql(
      `alter table "tenant_entity" alter column "id" set default gen_random_uuid();`,
    );

    this.addSql(`alter table "tag_entity" alter column "id" drop default;`);
    this.addSql(
      `alter table "tag_entity" alter column "id" type uuid using ("id"::text::uuid);`,
    );
    this.addSql(
      `alter table "tag_entity" alter column "id" set default gen_random_uuid();`,
    );

    this.addSql(`alter table "crawl_entity" alter column "id" drop default;`);
    this.addSql(
      `alter table "crawl_entity" alter column "id" type uuid using ("id"::text::uuid);`,
    );
    this.addSql(
      `alter table "crawl_entity" alter column "id" set default gen_random_uuid();`,
    );

    this.addSql(
      `alter table "collection_entity" alter column "id" drop default;`,
    );
    this.addSql(
      `alter table "collection_entity" alter column "id" type uuid using ("id"::text::uuid);`,
    );
    this.addSql(
      `alter table "collection_entity" alter column "id" set default gen_random_uuid();`,
    );

    this.addSql(
      `alter table "bookmark_entity" alter column "id" drop default;`,
    );
    this.addSql(
      `alter table "bookmark_entity" alter column "id" type uuid using ("id"::text::uuid);`,
    );
    this.addSql(
      `alter table "bookmark_entity" alter column "id" set default gen_random_uuid();`,
    );

    this.addSql(
      `alter table "bookmark_tag_entity" alter column "id" drop default;`,
    );
    this.addSql(
      `alter table "bookmark_tag_entity" alter column "id" type uuid using ("id"::text::uuid);`,
    );
    this.addSql(
      `alter table "bookmark_tag_entity" alter column "id" set default gen_random_uuid();`,
    );

    this.addSql(`alter table "account_entity" alter column "id" drop default;`);
    this.addSql(
      `alter table "account_entity" alter column "id" type uuid using ("id"::text::uuid);`,
    );
    this.addSql(
      `alter table "account_entity" alter column "id" set default gen_random_uuid();`,
    );

    this.addSql(`alter table "session_entity" alter column "id" drop default;`);
    this.addSql(
      `alter table "session_entity" alter column "id" type uuid using ("id"::text::uuid);`,
    );
    this.addSql(
      `alter table "session_entity" alter column "id" set default gen_random_uuid();`,
    );
  }
}
