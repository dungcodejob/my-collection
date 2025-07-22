export const SECOND = 1000;
export const MINUTE = 60 * SECOND;
export const HOUR = 60 * MINUTE;
export const DAY = 24 * HOUR;
export const WEEK = 7 * DAY;

export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

export const PAGE_SIZE_DEFAULT = {
  TABLE: PAGE_SIZE_OPTIONS[0],
  SELECT: PAGE_SIZE_OPTIONS[0],
} as const;

export const CURRENT_PAGE_DEFAULT = 1;
