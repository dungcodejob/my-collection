/**
 * Error codes constants for the entire application
 * This file centralizes all error codes to ensure consistency across the system
 */

// Authentication Error Codes
export const AUTH_ERROR_CODES = {
  EMAIL_ALREADY_EXISTS: 'Auth.EmailAlreadyExists',
  INVALID_EMAIL_OR_USERNAME: 'Auth.InvalidEmailOrUsername',
  INVALID_CREDENTIALS: 'Auth.InvalidCredentials',
  INVALID_TOKEN: 'Auth.InvalidToken',
  INVALID_REFRESH_TOKEN: 'Auth.InvalidRefreshToken',
  UNAUTHORIZED: 'Auth.Unauthorized',
  ACCESS_DENIED: 'Auth.AccessDenied',
  SESSION_EXPIRED: 'Auth.SessionExpired',
  ACCOUNT_LOCKED: 'Auth.AccountLocked',
  ACCOUNT_DISABLED: 'Auth.AccountDisabled',
  PASSWORD_EXPIRED: 'Auth.PasswordExpired',
  WEAK_PASSWORD: 'Auth.WeakPassword',
  PASSWORD_REUSE: 'Auth.PasswordReuse',
  TOO_MANY_LOGIN_ATTEMPTS: 'Auth.TooManyLoginAttempts',
  EMAIL_NOT_VERIFIED: 'Auth.EmailNotVerified',
  VERIFICATION_TOKEN_EXPIRED: 'Auth.VerificationTokenExpired',
  INVALID_VERIFICATION_TOKEN: 'Auth.InvalidVerificationToken',
} as const;

// User Error Codes
export const USER_ERROR_CODES = {
  NOT_FOUND: 'User.NotFound',
  NOT_EXIST: 'User.NotExist',
  INVALID_DATA: 'User.InvalidData',
  EMAIL_REQUIRED: 'User.EmailRequired',
  INVALID_EMAIL: 'User.InvalidEmail',
  USERNAME_REQUIRED: 'User.UsernameRequired',
  USERNAME_TOO_SHORT: 'User.UsernameTooShort',
  USERNAME_TOO_LONG: 'User.UsernameTooLong',
  USERNAME_INVALID_CHARACTERS: 'User.UsernameInvalidCharacters',
  USERNAME_ALREADY_EXISTS: 'User.UsernameAlreadyExists',
  PROFILE_UPDATE_FAILED: 'User.ProfileUpdateFailed',
  AVATAR_UPLOAD_FAILED: 'User.AvatarUploadFailed',
  INVALID_AVATAR_FORMAT: 'User.InvalidAvatarFormat',
  AVATAR_TOO_LARGE: 'User.AvatarTooLarge',
  PREFERENCES_UPDATE_FAILED: 'User.PreferencesUpdateFailed',
  ACCOUNT_DELETION_FAILED: 'User.AccountDeletionFailed',
} as const;

// Collection Error Codes
export const COLLECTION_ERROR_CODES = {
  NOT_FOUND: 'Collection.NotFound',
  ALREADY_EXISTS: 'Collection.AlreadyExists',
  CANNOT_MOVE_TO_SELF: 'Collection.CannotMoveToSelf',
  CANNOT_MOVE_TO_DESCENDANT: 'Collection.CannotMoveToDescendant',
  INVALID_PARENT: 'Collection.InvalidParent',
  MAX_DEPTH_EXCEEDED: 'Collection.MaxDepthExceeded',
  NAME_REQUIRED: 'Collection.NameRequired',
  NAME_TOO_LONG: 'Collection.NameTooLong',
  INVALID_NAME: 'Collection.InvalidName',
  HAS_CHILDREN: 'Collection.HasChildren',
  NOT_EMPTY: 'Collection.NotEmpty',
  ACCESS_DENIED: 'Collection.AccessDenied',
  INVALID_SORT_ORDER: 'Collection.InvalidSortOrder',
  CIRCULAR_REFERENCE: 'Collection.CircularReference',
  PATH_TOO_LONG: 'Collection.PathTooLong',
  INVALID_ICON: 'Collection.InvalidIcon',
  DESCRIPTION_TOO_LONG: 'Collection.DescriptionTooLong',
  ALREADY_DELETED: 'Collection.AlreadyDeleted',
  CANNOT_RESTORE: 'Collection.CannotRestore',
  INVALID_BULK_OPERATION: 'Collection.InvalidBulkOperation',
  EXPORT_FAILED: 'Collection.ExportFailed',
  IMPORT_FAILED: 'Collection.ImportFailed',
  INVALID_IMPORT_FORMAT: 'Collection.InvalidImportFormat',
  DUPLICATE_NAME_IN_PARENT: 'Collection.DuplicateNameInParent',
  INVALID_HIERARCHY: 'Collection.InvalidHierarchy',
  PERMISSION_DENIED: 'Collection.PermissionDenied',
} as const;

// Crawl Error Codes
export const CRAWL_ERROR_CODES = {
  NOT_FOUND: 'Crawl.NotFound',
  INVALID_URL: 'Crawl.InvalidUrl',
  URL_REQUIRED: 'Crawl.UrlRequired',
  URL_TOO_LONG: 'Crawl.UrlTooLong',
  UNSUPPORTED_PROTOCOL: 'Crawl.UnsupportedProtocol',
  PRIVATE_URL: 'Crawl.PrivateUrl',
  ALREADY_EXISTS: 'Crawl.AlreadyExists',
  IN_PROGRESS: 'Crawl.InProgress',
  ALREADY_COMPLETED: 'Crawl.AlreadyCompleted',
  CANNOT_RETRY: 'Crawl.CannotRetry',
  PROCESSING_FAILED: 'Crawl.ProcessingFailed',
  TIMEOUT: 'Crawl.Timeout',
  NETWORK_ERROR: 'Crawl.NetworkError',
  CONTENT_TOO_LARGE: 'Crawl.ContentTooLarge',
  UNSUPPORTED_CONTENT_TYPE: 'Crawl.UnsupportedContentType',
  RATE_LIMIT_EXCEEDED: 'Crawl.RateLimitExceeded',
  INVALID_TYPE: 'Crawl.InvalidType',
  EXPIRED: 'Crawl.Expired',
  ACCESS_DENIED: 'Crawl.AccessDenied',
  INVALID_BATCH_SIZE: 'Crawl.InvalidBatchSize',
  EMPTY_BATCH: 'Crawl.EmptyBatch',
  METADATA_EXTRACTION_FAILED: 'Crawl.MetadataExtractionFailed',
  SCREENSHOT_FAILED: 'Crawl.ScreenshotFailed',
  INVALID_SEARCH_PARAMS: 'Crawl.InvalidSearchParams',
  DATABASE_ERROR: 'Crawl.DatabaseError',
  SERVICE_UNAVAILABLE: 'Crawl.ServiceUnavailable',
  INVALID_PAGINATION: 'Crawl.InvalidPagination',
  QUOTA_EXCEEDED: 'Crawl.QuotaExceeded',
  INVALID_DATE_RANGE: 'Crawl.InvalidDateRange',
  CONCURRENT_LIMIT_EXCEEDED: 'Crawl.ConcurrentLimitExceeded',
  INVALID_CONFIGURATION: 'Crawl.InvalidConfiguration',
  RESOURCE_NOT_ACCESSIBLE: 'Crawl.ResourceNotAccessible',
  INVALID_RESPONSE: 'Crawl.InvalidResponse',
  REDIRECT_LIMIT_EXCEEDED: 'Crawl.RedirectLimitExceeded',
  SECURITY_VIOLATION: 'Crawl.SecurityViolation',
  MAINTENANCE_MODE: 'Crawl.MaintenanceMode',
} as const;

// General System Error Codes
export const SYSTEM_ERROR_CODES = {
  INTERNAL_SERVER_ERROR: 'System.InternalServerError',
  DATABASE_CONNECTION_FAILED: 'System.DatabaseConnectionFailed',
  DATABASE_QUERY_FAILED: 'System.DatabaseQueryFailed',
  VALIDATION_FAILED: 'System.ValidationFailed',
  INVALID_REQUEST_FORMAT: 'System.InvalidRequestFormat',
  MISSING_REQUIRED_FIELD: 'System.MissingRequiredField',
  INVALID_FIELD_TYPE: 'System.InvalidFieldType',
  FIELD_TOO_LONG: 'System.FieldTooLong',
  FIELD_TOO_SHORT: 'System.FieldTooShort',
  INVALID_ENUM_VALUE: 'System.InvalidEnumValue',
  RESOURCE_LIMIT_EXCEEDED: 'System.ResourceLimitExceeded',
  SERVICE_TEMPORARILY_UNAVAILABLE: 'System.ServiceTemporarilyUnavailable',
  MAINTENANCE_MODE: 'System.MaintenanceMode',
  FEATURE_NOT_AVAILABLE: 'System.FeatureNotAvailable',
  DEPRECATED_ENDPOINT: 'System.DeprecatedEndpoint',
} as const;

// Bookmark Error Codes
export const BOOKMARK_ERROR_CODES = {
  NOT_FOUND: 'Bookmark.NotFound',
  ALREADY_EXISTS: 'Bookmark.AlreadyExists',
  INVALID_URL: 'Bookmark.InvalidUrl',
  URL_REQUIRED: 'Bookmark.UrlRequired',
  TITLE_REQUIRED: 'Bookmark.TitleRequired',
  TITLE_TOO_LONG: 'Bookmark.TitleTooLong',
  DESCRIPTION_TOO_LONG: 'Bookmark.DescriptionTooLong',
  INVALID_COLLECTION: 'Bookmark.InvalidCollection',
  ACCESS_DENIED: 'Bookmark.AccessDenied',
  BULK_OPERATION_FAILED: 'Bookmark.BulkOperationFailed',
  INVALID_TAGS: 'Bookmark.InvalidTags',
  TOO_MANY_TAGS: 'Bookmark.TooManyTags',
  DUPLICATE_IN_COLLECTION: 'Bookmark.DuplicateInCollection',
  CANNOT_MOVE_TO_COLLECTION: 'Bookmark.CannotMoveToCollection',
  METADATA_EXTRACTION_FAILED: 'Bookmark.MetadataExtractionFailed',
  INVALID_FAVORITE_STATUS: 'Bookmark.InvalidFavoriteStatus',
  VISIT_COUNT_ERROR: 'Bookmark.VisitCountError',
  EXPORT_FAILED: 'Bookmark.ExportFailed',
  IMPORT_FAILED: 'Bookmark.ImportFailed',
} as const;

// File/Upload Error Codes
export const FILE_ERROR_CODES = {
  UPLOAD_FAILED: 'File.UploadFailed',
  INVALID_FORMAT: 'File.InvalidFormat',
  TOO_LARGE: 'File.TooLarge',
  TOO_SMALL: 'File.TooSmall',
  CORRUPTED: 'File.Corrupted',
  VIRUS_DETECTED: 'File.VirusDetected',
  STORAGE_FULL: 'File.StorageFull',
  PROCESSING_FAILED: 'File.ProcessingFailed',
  DOWNLOAD_FAILED: 'File.DownloadFailed',
  DELETE_FAILED: 'File.DeleteFailed',
  ACCESS_DENIED: 'File.AccessDenied',
  NOT_FOUND: 'File.NotFound',
  ALREADY_EXISTS: 'File.AlreadyExists',
} as const;

// Tag Error Codes
export const TAG_ERROR_CODES = {
  NOT_FOUND: 'Tag.NotFound',
  ALREADY_EXISTS: 'Tag.AlreadyExists',
  CANNOT_DELETE: 'Tag.CannotDelete',
  CANNOT_REMOVE: 'Tag.CannotRemove',
  ALREADY_ASSIGNED: 'Tag.AlreadyAssigned',
  NOT_ASSIGNED: 'Tag.NotAssigned',
  INVALID_NAME: 'Tag.InvalidName',
  NAME_REQUIRED: 'Tag.NameRequired',
  NAME_TOO_LONG: 'Tag.NameTooLong',
  DESCRIPTION_TOO_LONG: 'Tag.DescriptionTooLong',
  INVALID_COLOR: 'Tag.InvalidColor',
  INVALID_CATEGORY: 'Tag.InvalidCategory',
  SYSTEM_TAG_PROTECTED: 'Tag.SystemTagProtected',
  BULK_OPERATION_FAILED: 'Tag.BulkOperationFailed',
  ASSIGNMENT_FAILED: 'Tag.AssignmentFailed',
  USAGE_COUNT_ERROR: 'Tag.UsageCountError',
  INVALID_CONFIDENCE: 'Tag.InvalidConfidence',
  AUTO_GENERATION_FAILED: 'Tag.AutoGenerationFailed',
} as const;

// Export all error codes as a single object for easy access
export const ERROR_CODES = {
  AUTH: AUTH_ERROR_CODES,
  USER: USER_ERROR_CODES,
  COLLECTION: COLLECTION_ERROR_CODES,
  CRAWL: CRAWL_ERROR_CODES,
  BOOKMARK: BOOKMARK_ERROR_CODES,
  TAG: TAG_ERROR_CODES,
  SYSTEM: SYSTEM_ERROR_CODES,
  FILE: FILE_ERROR_CODES,
} as const;

// Type definitions for better TypeScript support
export type AuthErrorCode =
  (typeof AUTH_ERROR_CODES)[keyof typeof AUTH_ERROR_CODES];
export type UserErrorCode =
  (typeof USER_ERROR_CODES)[keyof typeof USER_ERROR_CODES];
export type CollectionErrorCode =
  (typeof COLLECTION_ERROR_CODES)[keyof typeof COLLECTION_ERROR_CODES];
export type CrawlErrorCode =
  (typeof CRAWL_ERROR_CODES)[keyof typeof CRAWL_ERROR_CODES];
export type BookmarkErrorCode =
  (typeof BOOKMARK_ERROR_CODES)[keyof typeof BOOKMARK_ERROR_CODES];
export type TagErrorCode =
  (typeof TAG_ERROR_CODES)[keyof typeof TAG_ERROR_CODES];
export type SystemErrorCode =
  (typeof SYSTEM_ERROR_CODES)[keyof typeof SYSTEM_ERROR_CODES];
export type FileErrorCode =
  (typeof FILE_ERROR_CODES)[keyof typeof FILE_ERROR_CODES];

export type ErrorCode =
  | AuthErrorCode
  | UserErrorCode
  | CollectionErrorCode
  | CrawlErrorCode
  | BookmarkErrorCode
  | TagErrorCode
  | SystemErrorCode
  | FileErrorCode;

// Error messages mapping for internationalization support
export const ERROR_MESSAGES = {
  // Authentication Messages
  [AUTH_ERROR_CODES.EMAIL_ALREADY_EXISTS]:
    'Email address is already registered',
  [AUTH_ERROR_CODES.INVALID_EMAIL_OR_USERNAME]:
    'Invalid email or username provided',
  [AUTH_ERROR_CODES.INVALID_CREDENTIALS]: 'Invalid login credentials',
  [AUTH_ERROR_CODES.INVALID_TOKEN]: 'Invalid or expired authentication token',
  [AUTH_ERROR_CODES.INVALID_REFRESH_TOKEN]: 'Invalid or expired refresh token',
  [AUTH_ERROR_CODES.UNAUTHORIZED]:
    'Authentication required to access this resource',
  [AUTH_ERROR_CODES.ACCESS_DENIED]: 'Access denied - insufficient permissions',
  [AUTH_ERROR_CODES.SESSION_EXPIRED]:
    'Your session has expired, please login again',
  [AUTH_ERROR_CODES.ACCOUNT_LOCKED]:
    'Account is temporarily locked due to security reasons',
  [AUTH_ERROR_CODES.ACCOUNT_DISABLED]: 'Account has been disabled',
  [AUTH_ERROR_CODES.PASSWORD_EXPIRED]:
    'Password has expired and must be changed',
  [AUTH_ERROR_CODES.WEAK_PASSWORD]:
    'Password does not meet security requirements',
  [AUTH_ERROR_CODES.PASSWORD_REUSE]: 'Cannot reuse previous passwords',
  [AUTH_ERROR_CODES.TOO_MANY_LOGIN_ATTEMPTS]:
    'Too many failed login attempts, please try again later',
  [AUTH_ERROR_CODES.EMAIL_NOT_VERIFIED]:
    'Email address must be verified before login',
  [AUTH_ERROR_CODES.VERIFICATION_TOKEN_EXPIRED]:
    'Email verification token has expired',
  [AUTH_ERROR_CODES.INVALID_VERIFICATION_TOKEN]:
    'Invalid email verification token',

  // User Messages
  [USER_ERROR_CODES.NOT_FOUND]: 'User not found',
  [USER_ERROR_CODES.NOT_EXIST]: 'User does not exist',
  [USER_ERROR_CODES.INVALID_DATA]: 'Invalid user data provided',
  [USER_ERROR_CODES.EMAIL_REQUIRED]: 'Email address is required',
  [USER_ERROR_CODES.INVALID_EMAIL]: 'Invalid email address format',
  [USER_ERROR_CODES.USERNAME_REQUIRED]: 'Username is required',
  [USER_ERROR_CODES.USERNAME_TOO_SHORT]:
    'Username must be at least 3 characters long',
  [USER_ERROR_CODES.USERNAME_TOO_LONG]: 'Username cannot exceed 50 characters',
  [USER_ERROR_CODES.USERNAME_INVALID_CHARACTERS]:
    'Username contains invalid characters',
  [USER_ERROR_CODES.USERNAME_ALREADY_EXISTS]: 'Username is already taken',
  [USER_ERROR_CODES.PROFILE_UPDATE_FAILED]: 'Failed to update user profile',
  [USER_ERROR_CODES.AVATAR_UPLOAD_FAILED]: 'Failed to upload avatar image',
  [USER_ERROR_CODES.INVALID_AVATAR_FORMAT]: 'Invalid avatar image format',
  [USER_ERROR_CODES.AVATAR_TOO_LARGE]: 'Avatar image is too large',
  [USER_ERROR_CODES.PREFERENCES_UPDATE_FAILED]:
    'Failed to update user preferences',
  [USER_ERROR_CODES.ACCOUNT_DELETION_FAILED]: 'Failed to delete user account',
} as const;
