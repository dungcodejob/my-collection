import { AccountEntity, SessionEntity, UserEntity } from '@app/entities';
import { Migrator } from '@mikro-orm/migrations';
import { PostgreSqlDriver, defineConfig } from '@mikro-orm/postgresql';
import { SeedManager } from '@mikro-orm/seeder';
import { SqlHighlighter } from '@mikro-orm/sql-highlighter';
import * as dotenv from 'dotenv';

const NODE_ENV = process.env.NODE_ENV || 'dev';

dotenv.config({ path: `.env.${NODE_ENV}` });

export const databaseConfig = defineConfig({
  driver: PostgreSqlDriver,
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432', 10),
  user: process.env.DATABASE_USER || 'postgres',
  password: process.env.DATABASE_PASSWORD || 'password',
  dbName: process.env.DATABASE_NAME || 'pokemon',
  entities: [AccountEntity, UserEntity, SessionEntity],
  entitiesTs: [AccountEntity, UserEntity, SessionEntity],
  debug: NODE_ENV === 'dev',
  highlighter: new SqlHighlighter(),
  extensions: [Migrator, SeedManager],
  migrations: {
    path: 'dist/migrations',
    pathTs: 'migrations',
  },
});

// const config: Options = {
//   driver: PostgreSqlDriver,
//   host: process.env.DATABASE_HOST || 'localhost',
//   port: parseInt(process.env.DATABASE_PORT || '5432', 10),
//   user: process.env.DATABASE_USER || 'postgres',
//   password: process.env.DATABASE_PASSWORD || 'postgres',
//   dbName: process.env.DATABASE_NAME || 'orbit',
//   entities: ['dist/entities/**/*.entity.js', 'entities/**/*.entity.ts'],
//   entitiesTs: ['entities/**/*.entity.ts'],
//   debug: process.env.NODE_ENV !== 'production',
//   metadataProvider: TsMorphMetadataProvider,
//   migrations: {
//     path: 'dist/migrations',
//     pathTs: 'src/migrations',
//     tableName: 'mikro_orm_migrations',
//     glob: '!(*.d).{js,ts}',
//     transactional: true,
//     disableForeignKeys: false,
//     allOrNothing: true,
//     dropTables: false,
//     safe: false,
//     snapshot: false,
//     emit: 'ts',
//   },
// };

export default databaseConfig;
