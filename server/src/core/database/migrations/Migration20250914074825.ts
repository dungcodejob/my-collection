import { Migration } from '@mikro-orm/migrations';

export class Migration20250914074825 extends Migration {
  override async up(): Promise<void> {
    this.addSql(`alter table "user_entity" drop column "gender";`);
  }

  override async down(): Promise<void> {
    this.addSql(
      `alter table "user_entity" add column "gender" varchar(255) not null;`,
    );
  }
}
