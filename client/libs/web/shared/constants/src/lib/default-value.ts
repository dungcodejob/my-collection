export const COLLECTION_ROOT_ID = "COLLECTION_ROOT_ID";
export const COLLECTION_ROOT_PATH = "/";

export const SECOND = 1000;
export const MINUTE = 60 * SECOND;
export const HOUR = 60 * MINUTE;
export const DAY = 24 * HOUR;
export const WEEK = 7 * DAY;



export const BYTE = 1024;
export const MB = BYTE * BYTE;
export const MEMORY_HEAP_LIMIT = 150 * MB;
export const MEMORY_RSS_LIMIT = 200 * MB;


export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

export const PAGE_SIZE_DEFAULT = {
  TABLE: PAGE_SIZE_OPTIONS[0],
  SELECT: PAGE_SIZE_OPTIONS[0],
} as const;

export const CURRENT_PAGE_DEFAULT = 1;
