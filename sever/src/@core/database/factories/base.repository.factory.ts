import { EntityRepository } from '@mikro-orm/core';

export type MockRepository<T extends object> = jest.Mocked<EntityRepository<T>>;

export class BaseRepositoryFactory<T extends object> {
  private entity: any;
  private customMethods: Record<string, jest.Mock> = {};

  constructor(entity: any) {
    this.entity = entity;
  }

  createMockRepository(): MockRepository<T> {
    return {
      findAll: jest.fn().mockImplementation(() => Promise.resolve([])),
      findAndCount: jest
        .fn()
        .mockImplementation(() => Promise.resolve([[], 0])),
      findByCursor: jest.fn(),
      findOneOrFail: jest.fn().mockImplementation(() => Promise.resolve(null)),
      canPopulate: jest.fn(),
      insert: jest.fn(),
      insertMany: jest.fn(),
      upsertMany: jest.fn(),
      assign: jest.fn(),
      getEntityName: jest.fn(),
      getReference: jest.fn(),
      map: jest.fn(),
      merge: jest.fn(),
      nativeDelete: jest.fn(),
      nativeUpdate: jest.fn(),
      populate: jest.fn(),
      validateRepositoryType: jest.fn(),
      create: jest.fn().mockImplementation((dto) => this.entity.create(dto)),
      findOne: jest.fn().mockImplementation(() => Promise.resolve(null)),
      find: jest.fn().mockImplementation(() => Promise.resolve([])),
      upsert: jest.fn().mockImplementation(() => Promise.resolve(true)),
      count: jest.fn().mockImplementation(() => Promise.resolve(0)),
      getEntityManager: jest.fn(),
      ...this.customMethods,
    } as unknown as MockRepository<T>;
  }

  addCustomMethod(name: string, implementation: jest.Mock) {
    this.customMethods[name] = implementation;
    return this;
  }
}
