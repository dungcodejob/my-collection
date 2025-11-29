/**
 * Request payload for searching tags
 */
export interface SearchTagRequest {
  readonly q: string;
  readonly limit?: number;
}

/**
 * Request payload for getting popular tags
 */
export interface PopularTagRequest {
  readonly limit?: number;
}

