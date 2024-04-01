import { Inject } from '@nestjs/common';
import { ConfigType, registerAs } from '@nestjs/config';

export const databaseConfig = registerAs('database', () => ({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'dungcool102608',
  dbName: process.env.DB_NAME || 'my_collection_app',
}));

export type DatabaseConfig = ConfigType<typeof databaseConfig>;
export const InjectDatabaseConfig = () => Inject(databaseConfig.KEY);
