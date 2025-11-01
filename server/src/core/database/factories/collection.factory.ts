import { CollectionEntity, UserEntity } from '@app/entities';
import { faker } from '@faker-js/faker';

/**
 * Collection Entity Factory using Faker.js for realistic test data
 * Can be used in both testing and development environments
 */

/**
 * Create a mock Collection entity with realistic data
 */
export const createMockCollection = (
  overrides: Partial<CollectionEntity> = {},
): CollectionEntity =>
  ({
    id: faker.string.uuid(),
    name: faker.commerce.department(),
    icon: faker.datatype.boolean({ probability: 0.7 })
      ? faker.helpers.arrayElement([
          'folder',
          'folder-open',
          'archive',
          'bookmark',
          'star',
          'heart',
          'tag',
          'file',
          'image',
          'video',
          'music',
          'document',
        ])
      : undefined,
    parentId: faker.datatype.boolean({ probability: 0.3 })
      ? faker.string.uuid()
      : undefined,
    parentPath: faker.datatype.boolean({ probability: 0.3 })
      ? faker.system.directoryPath().replace(/\\/g, '/')
      : undefined,
    path: faker.system.filePath().replace(/\\/g, '/'),
    description: faker.datatype.boolean({ probability: 0.6 })
      ? faker.lorem.sentence()
      : undefined,
    sortOrder: faker.number.int({ min: 0, max: 100 }),
    isHasChild: faker.datatype.boolean({ probability: 0.4 }),
    isActive: faker.datatype.boolean({ probability: 0.9 }),
    createAt: faker.date.recent({ days: 30 }),
    updateAt: faker.date.recent({ days: 7 }),
    deletedAt: faker.datatype.boolean({ probability: 0.05 })
      ? faker.date.recent({ days: 30 })
      : undefined,
    deleteFlag: faker.datatype.boolean({ probability: 0.05 }),
    ...overrides,
  }) as CollectionEntity;

/**
 * Create multiple mock collections
 */
export const createMockCollections = (
  count: number,
  overrides: Partial<CollectionEntity> = {},
): CollectionEntity[] => {
  return Array.from({ length: count }, () => createMockCollection(overrides));
};

/**
 * Create a root collection (no parent)
 */
export const createRootCollection = (
  overrides: Partial<CollectionEntity> = {},
): CollectionEntity =>
  createMockCollection({
    path: faker.commerce.department(),
    ...overrides,
  });

/**
 * Create a child collection with specific parent
 */
export const createChildCollection = (
  parentCollection: CollectionEntity,
  overrides: Partial<CollectionEntity> = {},
): CollectionEntity => {
  const childName = faker.commerce.productName();
  return createMockCollection({
    parent: parentCollection,
    path: `${parentCollection.path}/${childName}`,
    ...overrides,
  });
};

/**
 * Create a collection hierarchy (parent with children)
 */
export const createCollectionHierarchy = (
  childrenCount: number = 3,
  maxDepth: number = 2,
): {
  parent: CollectionEntity;
  children: CollectionEntity[];
  grandChildren: CollectionEntity[];
} => {
  const parent = createRootCollection();
  const children: CollectionEntity[] = [];
  const grandChildren: CollectionEntity[] = [];

  // Create children
  for (let i = 0; i < childrenCount; i++) {
    const child = createChildCollection(parent);
    children.push(child);

    // Create grandchildren if maxDepth > 1
    if (maxDepth > 1) {
      const grandChildrenCount = faker.number.int({ min: 1, max: 2 });
      for (let j = 0; j < grandChildrenCount; j++) {
        const grandChild = createChildCollection(child);
        grandChildren.push(grandChild);
      }
    }
  }

  return { parent, children, grandChildren };
};

/**
 * Create collections with specific states for testing
 */
export const createActiveCollection = (
  overrides: Partial<CollectionEntity> = {},
): CollectionEntity =>
  createMockCollection({
    isActive: true,
    deleteFlag: false,
    deletedAt: undefined,
    ...overrides,
  });

export const createInactiveCollection = (
  overrides: Partial<CollectionEntity> = {},
): CollectionEntity =>
  createMockCollection({
    isActive: false,
    deleteFlag: false,
    deletedAt: undefined,
    ...overrides,
  });

export const createDeletedCollection = (
  overrides: Partial<CollectionEntity> = {},
): CollectionEntity =>
  createMockCollection({
    isActive: false,
    deleteFlag: true,
    deletedAt: faker.date.recent({ days: 30 }),
    ...overrides,
  });

/**
 * Create collections with specific icons for testing
 */
export const createFolderCollection = (
  overrides: Partial<CollectionEntity> = {},
): CollectionEntity =>
  createMockCollection({
    icon: 'folder',
    name: `${faker.commerce.department()} Folder`,
    ...overrides,
  });

export const createBookmarkCollection = (
  overrides: Partial<CollectionEntity> = {},
): CollectionEntity =>
  createMockCollection({
    icon: 'bookmark',
    name: `${faker.commerce.productName()} Bookmarks`,
    ...overrides,
  });

export const createArchiveCollection = (
  overrides: Partial<CollectionEntity> = {},
): CollectionEntity =>
  createMockCollection({
    icon: 'archive',
    name: `${faker.commerce.department()} Archive`,
    isActive: false,
    ...overrides,
  });

/**
 * Create collections for specific user
 */
export const createUserCollections = (
  user: UserEntity,
  count: number = 5,
): CollectionEntity[] => {
  return createMockCollections(count, { user });
};

/**
 * Create a complete collection tree for testing
 */
export const createCollectionTree = (
  user: UserEntity,
  rootCount: number = 3,
  childrenPerRoot: number = 2,
  maxDepth: number = 3,
): CollectionEntity[] => {
  const allCollections: CollectionEntity[] = [];

  for (let i = 0; i < rootCount; i++) {
    const root = createRootCollection({ user });
    allCollections.push(root);

    // Create children recursively
    const children = createChildrenRecursively(
      root,
      user,
      childrenPerRoot,
      maxDepth - 1,
    );
    allCollections.push(...children);
  }

  return allCollections;
};

/**
 * Helper function to create children recursively
 */
function createChildrenRecursively(
  parent: CollectionEntity,
  user: UserEntity,
  childrenCount: number,
  remainingDepth: number,
): CollectionEntity[] {
  if (remainingDepth <= 0) return [];

  const children: CollectionEntity[] = [];

  for (let i = 0; i < childrenCount; i++) {
    const child = createChildCollection(parent, { user });
    children.push(child);

    // Recursively create grandchildren
    if (remainingDepth > 1) {
      const grandChildren = createChildrenRecursively(
        child,
        user,
        Math.max(1, childrenCount - 1), // Reduce children count at each level
        remainingDepth - 1,
      );
      children.push(...grandChildren);
    }
  }

  return children;
}

/**
 * Generate seed collections for development
 */
export const generateSeedCollections = (
  users: UserEntity[],
  collectionsPerUser: number = 10,
): CollectionEntity[] => {
  const collections: CollectionEntity[] = [];

  users.forEach((user) => {
    // Calculate parameters based on collectionsPerUser
    const rootCount = Math.max(1, Math.floor(collectionsPerUser / 6)); // Each root will have ~5 descendants
    const childrenPerRoot = Math.max(
      1,
      Math.floor(collectionsPerUser / (rootCount * 3)),
    ); // Distribute remaining collections

    const userCollections = createCollectionTree(
      user,
      rootCount,
      childrenPerRoot,
      3, // Max depth of 3
    );
    collections.push(...userCollections);
  });

  return collections;
};

/**
 * Create collections with specific search scenarios
 */
export const createSearchableCollections = (
  user: UserEntity,
): CollectionEntity[] => {
  return [
    createMockCollection({
      user,
      name: 'Work Documents',
      description: 'Important work-related documents and files',
      icon: 'folder',
    }),
    createMockCollection({
      user,
      name: 'Personal Photos',
      description: 'Family photos and personal memories',
      icon: 'image',
    }),
    createMockCollection({
      user,
      name: 'Music Collection',
      description: 'Favorite songs and playlists',
      icon: 'music',
    }),
    createMockCollection({
      user,
      name: 'Video Archive',
      description: 'Movies, tutorials, and video content',
      icon: 'video',
    }),
    createMockCollection({
      user,
      name: 'Bookmarks',
      description: 'Useful websites and online resources',
      icon: 'bookmark',
    }),
  ];
};

/**
 * Create collections for performance testing
 */
export const createLargeCollectionSet = (
  user: UserEntity,
  count: number = 1000,
): CollectionEntity[] => {
  const collections: CollectionEntity[] = [];
  const batchSize = 100;

  for (let i = 0; i < count; i += batchSize) {
    const batch = createMockCollections(Math.min(batchSize, count - i), {
      user,
    });
    collections.push(...batch);
  }

  return collections;
};

/**
 * Create collections with specific sort orders for testing
 */
export const createSortedCollections = (
  user: UserEntity,
  count: number = 5,
): CollectionEntity[] => {
  return Array.from({ length: count }, (_, index) =>
    createMockCollection({
      user,
      name: `Collection ${String(index + 1).padStart(2, '0')}`,
      sortOrder: index,
    }),
  );
};
