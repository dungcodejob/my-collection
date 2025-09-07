export const RESPONSE_KEY = {
  MESSAGE: 'message',
} as const;

export const REQUEST_KEY = {
  CURRENT_ACCOUNT: 'account',
  CURRENT_SESSION: 'session',
  CURRENT_USER: 'user',
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
  AUTH: 'jwt-auth',
  REFRESH: 'refresh-token',
} as const;

export const FEATURE_KEY = {
  AUTH: 'Auth',
  USER: 'user',
  COLLECTION: 'collection',
  HEALTH: 'health',
} as const;
