import { CrawlEntity } from '@app/entities';
import {
  BaseRepositoryFactory,
  MockRepository,
} from '../../database/factories';

export const createCrawlRepositoryMock = (): MockRepository<CrawlEntity> => {
  return new BaseRepositoryFactory<CrawlEntity>(CrawlEntity)
    .addCustomMethod('findByUserId', jest.fn())
    .addCustomMethod('findByUrl', jest.fn())
    .addCustomMethod('findByStatus', jest.fn())
    .addCustomMethod('findPendingCrawls', jest.fn())
    .addCustomMethod('findByCrawlType', jest.fn())
    .addCustomMethod('findSuccessfulCrawls', jest.fn())
    .addCustomMethod('findRetryableCrawls', jest.fn())
    .addCustomMethod('findExpiredCrawls', jest.fn())
    .addCustomMethod('findWithPagination', jest.fn())
    .addCustomMethod('countByStatus', jest.fn())
    .addCustomMethod('getCrawlStats', jest.fn())
    .addCustomMethod('findRecentCrawls', jest.fn())
    .addCustomMethod('cleanupOldCrawls', jest.fn())
    .addCustomMethod('updateStatusBatch', jest.fn())
    .addCustomMethod('findDuplicateUrls', jest.fn())
    .addCustomMethod('getAverageCrawlDuration', jest.fn())
    .createMockRepository();
};
