// API Base URLs
export const API_CONFIG = {
  BASE_URL: {
    DEVELOPMENT: "http://localhost:3000/api",
    PRODUCTION: "https://your-production-api.com/api",
    STAGING: "https://your-staging-api.com/api",
  },
  VERSION: "v1",
} as const;

// API Endpoints
export const API_ENDPOINTS = {
  ASSETS: {
    BASE: "/assets",
    UPLOAD: "/assets/upload",
  },
  AUTH: {
    LOGIN: "/auth/login",
    LOGOUT: "/auth/logout",
    REFRESH: "/auth/refresh",
    REGISTER: "/auth/register",
    FORGOT_PASSWORD: "/auth/forgot-password",
    RESET_PASSWORD: "/auth/reset-password",
    VERIFY_EMAIL: "/auth/verify-email",
  },
  USER: {
    PROFILE: "/user/profile",
    UPDATE_PROFILE: "/user/profile",
    CHANGE_PASSWORD: "/user/change-password",
  },
  COLLECTIONS: {
    BASE: "/collection",
    BY_ID: (id: string) => `/collection/${id}`,
    BOOKMARKS: (collectionId: string) => `/collection/${collectionId}/bookmarks`,
    ITEMS: (collectionId: string) => `/collection/${collectionId}/items`,
    ITEM_BY_ID: (collectionId: string, itemId: string) =>
      `/collection/${collectionId}/items/${itemId}`,
  },
  BOOKMARKS: {
    BASE: "/bookmark",
    BY_ID: (id: string) => `/bookmark/${id}`,
    CHECK_DUPLICATE: "/bookmark/check-duplicate",
  },
  CRAWL: {
    METADATA: "/crawl/metadata",
  },
  METADATA: {
    BASE: "/metadata",
  },
  TAGS: {
    BASE: "/tag",
    BY_ID: (id: string) => `/tag/${id}`,
    SEARCH: "/tag/search",
    POPULAR: "/tag/popular",
  },
} as const;

// HTTP Configuration
export const HTTP_CONFIG = {
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
} as const;

// Helper function to get full API URL
export const getApiUrl = (
  endpoint: string,
  environment: keyof typeof API_CONFIG.BASE_URL = "DEVELOPMENT"
): string => {
  const baseUrl = API_CONFIG.BASE_URL[environment];
  return `${baseUrl}${endpoint}`;
};

// Helper function to get versioned API URL
export const getVersionedApiUrl = (
  endpoint: string,
  environment: keyof typeof API_CONFIG.BASE_URL = "DEVELOPMENT"
): string => {
  const baseUrl = API_CONFIG.BASE_URL[environment];
  return `${baseUrl}/${API_CONFIG.VERSION}${endpoint}`;
};
