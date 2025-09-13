import { ModuleMetadata } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { appConfig, cookieConfig, jwtConfig } from '@app/configs';
import { provideMockUnitOfWork } from './mocks';

beforeAll(async () => {
  // Setup test database
  process.env.NODE_ENV = 'dev';
  process.env.DATABASE_URL = 'sqlite::memory:';
});

beforeEach(() => {
  jest.clearAllMocks();
});

export const createTestingModule = async (metadata: ModuleMetadata) => {
  return Test.createTestingModule({
    imports: [
      ConfigModule.forRoot({
        load: [appConfig, cookieConfig, jwtConfig],
        isGlobal: true,
        envFilePath: '.env.test',
      }),
      ...(metadata.imports || []),
    ],
    providers: [...(metadata.providers || []), ...provideMockUnitOfWork()],
  }).compile();
};
