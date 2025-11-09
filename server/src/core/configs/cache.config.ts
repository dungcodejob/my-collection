import { registerAs } from '@nestjs/config';

export interface CacheConfig {
  ttl: number; // Time to live in seconds
  max: number; // Maximum number of items in cache
  host?: string;
  port?: number;
}

export const cacheConfig = registerAs(
  'cache',
  (): CacheConfig => ({
    ttl: parseInt(process.env.CACHE_TTL || '86400', 10), // 24 hours default
    max: parseInt(process.env.CACHE_MAX || '100', 10),
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
  }),
);
