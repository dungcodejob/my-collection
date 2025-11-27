/**
 * Configuration constants for bookmark image selector
 */
export const IMAGE_SELECTOR_CONFIG = {
  /** Maximum file size in megabytes */
  MAX_FILE_SIZE_MB: 5,

  /** Maximum file size in bytes */
  MAX_FILE_SIZE_BYTES: 5 * 1024 * 1024,

  /** Supported image formats */
  SUPPORTED_FORMATS: [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
  ] as const,

  /** Gallery display settings */
  GALLERY: {
    COLUMNS: 4,
    MAX_VISIBLE_INLINE: 8,
    DIALOG_COLUMNS: 5,
  },

  /** Error messages */
  ERRORS: {
    FILE_TOO_LARGE: "Image must be less than 5MB",
    INVALID_FORMAT: "Only JPEG, PNG, GIF, and WebP images are supported",
    URL_INVALID: "Please enter a valid image URL",
    UPLOAD_FAILED: "Failed to upload image. Please try again.",
    LOAD_FAILED: "Failed to load image",
  },
} as const;
