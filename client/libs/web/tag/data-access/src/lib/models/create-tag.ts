/**
 * Request payload for creating a new tag
 */
export interface CreateTagRequest {
  readonly name: string;
  readonly description?: string;
  readonly color?: string;
  readonly category?: string;
  readonly collectionId: string;
}
