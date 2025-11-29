/**
 * Tag model representing a tag entity
 */
export interface Tag {
  readonly id: string;
  name: string;
  displayName: string;
  color?: string;
  category?: string;
  usageCount: number;
  isActive: boolean;
  isSystem: boolean;
  authorId?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Tag summary for display in collections
 */
export interface TagSummary {
  readonly id: string;
  name: string;
  displayName: string;
  color?: string;
}

/**
 * Tag suggestion for autocomplete dropdown
 */
export interface TagSuggestion extends TagSummary {
  usageCount: number;
  isAlreadyAdded?: boolean;
}

