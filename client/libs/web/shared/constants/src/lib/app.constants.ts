// Application Information
export const APP_INFO = {
  NAME: "My Collection",
  VERSION: "1.0.0",
  DESCRIPTION: "Multi-tenant collection management application",
  AUTHOR: "Your Team",
} as const;

// Storage Keys
export const STORAGE_KEYS = {
  AUTH: "auth",
  ACCESS_TOKEN: "access_token",
  REFRESH_TOKEN: "refresh_token",
  USER_PROFILE: "user_profile",
  THEME: "app_theme",
  LANGUAGE: "app_language",
  TENANT_ID: "tenant_id",
  REDIRECT_URL: "redirect_url",
  DEVICE_ID: "device_id",
} as const;

// Route Paths
export const ROUTES = {
  HOME: "/",
  LOGIN: "/auth/login",
  REGISTER: "/auth/register",
  FORGOT_PASSWORD: "/auth/forgot-password",
  RESET_PASSWORD: "/auth/reset-password",
  DASHBOARD: "/dashboard",
  PROFILE: "/profile",
  COLLECTIONS: "/collections",
  COLLECTION_DETAIL: "/collections/:id",
  SETTINGS: "/settings",
} as const;

// UI Constants
export const UI_CONFIG = {
  DEBOUNCE_TIME: 300,
  TOAST_DURATION: 3000,
  MODAL_ANIMATION_DURATION: 200,
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 10,
    PAGE_SIZE_OPTIONS: [5, 10, 20, 50, 100],
  },
  BREAKPOINTS: {
    MOBILE: 768,
    TABLET: 1024,
    DESKTOP: 1200,
  },
} as const;

// Validation Constants
export const VALIDATION = {
  PASSWORD: {
    MIN_LENGTH: 8,
    MAX_LENGTH: 128,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBERS: true,
    REQUIRE_SPECIAL_CHARS: true,
  },
  EMAIL: {
    MAX_LENGTH: 254,
  },
  USERNAME: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 30,
  },
  COLLECTION: {
    NAME_MAX_LENGTH: 100,
    DESCRIPTION_MAX_LENGTH: 500,
  },
} as const;

// Date/Time Formats
export const DATE_FORMATS = {
  DISPLAY: "dd/MM/yyyy",
  DISPLAY_WITH_TIME: "dd/MM/yyyy HH:mm",
  API: "yyyy-MM-dd",
  API_WITH_TIME: "yyyy-MM-ddTHH:mm:ss.SSSZ",
} as const;

// File Upload Constants
export const FILE_UPLOAD = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: {
    IMAGES: ["image/jpeg", "image/png", "image/gif", "image/webp"],
    DOCUMENTS: [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ],
    ALL: [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ],
  },
} as const;
