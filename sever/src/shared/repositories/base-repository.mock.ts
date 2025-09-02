export const createCompleteRepositoryMock = () => ({
  // Basic CRUD operations
  find: jest.fn(),
  findOne: jest.fn(),
  findOneOrFail: jest.fn(),
  findAndCount: jest.fn(),
  count: jest.fn(),

  // Entity creation and management
  create: jest.fn(),
  assign: jest.fn(),
  persist: jest.fn(),
  persistAndFlush: jest.fn(),
  remove: jest.fn(),
  removeAndFlush: jest.fn(),
  flush: jest.fn(),

  // Advanced operations
  nativeInsert: jest.fn(),
  nativeUpdate: jest.fn(),
  nativeDelete: jest.fn(),
  aggregate: jest.fn(),
  populate: jest.fn(),

  // Repository metadata
  getEntityName: jest.fn(),
  getEntityManager: jest.fn(),
  getReference: jest.fn(),

  // Query builder
  createQueryBuilder: jest.fn(),
  qb: jest.fn(),

  // Utility methods
  canPopulate: jest.fn(),
});
