import { defineConfig } from '@mikro-orm/postgresql';

export default defineConfig({
  entities: [
    'dist/modules/**/entities/*.entity.js',
    'dist/common/entities/*.entity.ts',
  ],
  entitiesTs: [
    'src/modules/**/entities/*.entity.ts',
    'src/common/entities/*.entity.ts',
  ],

  host: process.env.PG_HOST || 'localhost',
  port: Number(process.env.PG_PORT) || 5432,
  user: process.env.PG_USERNAME || 'postgres',
  password: process.env.PG_PASSWORD || 'dungcool102608',
  dbName: process.env.PG_NAME || 'my_collection_app',

  migrations: {
    tableName: 'migrations_history', // name of database table with log of executed transactions
    path: './src/database/migrations', // path to the folder with migrations
    transactional: true, // wrap each migration in a transaction
    disableForeignKeys: true, // wrap statements with `set foreign_key_checks = 0` or equivalent
    allOrNothing: true, // wrap all migrations in master transaction
    dropTables: true, // allow to disable table dropping
    safe: true, // allow to disable table and column dropping
    emit: 'ts', // migration generation mode
  },
});

// const config = {
//   entities: [
//     'dist/modules/**/entities/*.entity.js',
//     'dist/common/entities/*.entity.ts',
//   ],
//   entitiesTs: [
//     'src/modules/**/entities/*.entity.ts',
//     'src/common/entities/*.entity.ts',
//   ],
//   type: 'postgresql',

//   host: process.env.PG_HOST || 'localhost',
//   port: Number(process.env.PG_PORT) || 5432,
//   username: process.env.PG_USERNAME || 'postgres',
//   password: process.env.PG_PASSWORD || 'dungcool102608',
//   dbName: process.env.PG_NAME || 'my_collection_app',

//   migrations: {
//     tableName: 'migrations_history', // name of database table with log of executed transactions
//     path: './src/database/migrations', // path to the folder with migrations
//     pattern: /^[\w-]+\d+\.ts$/, // regex pattern for the migration files
//     transactional: true, // wrap each migration in a transaction
//     disableForeignKeys: true, // wrap statements with `set foreign_key_checks = 0` or equivalent
//     allOrNothing: true, // wrap all migrations in master transaction
//     dropTables: true, // allow to disable table dropping
//     safe: true, // allow to disable table and column dropping
//     emit: 'ts', // migration generation mode
//   },
// } as Options;
// export default config;
