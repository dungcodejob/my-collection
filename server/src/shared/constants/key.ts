export const RESPONSE_KEY = {
  MESSAGE: 'message',
} as const;

export const REQUEST_KEY = {
  CURRENT_ACCOUNT: 'account',
  CURRENT_SESSION: 'session',
  CURRENT_USER: 'user',
  CURRENT_TENANT: 'tenant',
  REQUEST_ID: 'requestId',
} as const;

export const COOKIE_KEY = {
  AUTH_TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
} as const;

export const METADATA_KEY = {
  IS_PUBLIC: 'isPublic',
} as const;

export const SWAGGER_SCHEME = {
  JWT_AUTH: 'jwt-auth',
  API_KEY: 'api-key',
  BASIC_AUTH: 'basic-auth',
  REFRESH: 'refresh-token',
} as const;

export const FEATURE_KEY = {
  AUTH: 'auth',
  USER: 'user',
  COLLECTION: 'collection',
  HEALTH: 'health',
  CRAWL: 'crawl',
  BOOKMARK: 'bookmark',
  UPLOAD_FILE: 'upload-file',
  TAG: 'tag',
} as const;
