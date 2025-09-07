import { MikroOrmModule } from '@mikro-orm/nestjs';
import { EntityManager, SqliteDriver } from '@mikro-orm/sqlite';
import { Test } from '@nestjs/testing';

export class TestDbHelper {
  static async createTestingModule(entities: any[] = []) {
    return Test.createTestingModule({
      imports: [
        MikroOrmModule.forRoot({
          driver: SqliteDriver,
          dbName: ':memory:',
          entities,
          debug: false,
        }),
      ],
    }).compile();
  }

  static async cleanDatabase(em: EntityManager) {
    const connection = em.getConnection();
    await connection.execute('PRAGMA foreign_keys = OFF');

    // Get all table names
    const tables = await connection.execute(
      "SELECT name FROM sqlite_master WHERE type='table'",
    );

    // Clear all tables
    for (const table of tables) {
      if (table.name !== 'sqlite_sequence') {
        await connection.execute(`DELETE FROM ${table.name}`);
      }
    }

    await connection.execute('PRAGMA foreign_keys = ON');
  }
}
