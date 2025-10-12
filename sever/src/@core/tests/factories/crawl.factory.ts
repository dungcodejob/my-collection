import { CrawlEntity, CrawlStatus, CrawlType, UserEntity } from '@app/entities';
import { faker } from '@faker-js/faker';

/**
 * Crawl Entity Factory using Faker.js for realistic test data
 * Can be used in both testing and development environments
 */

/**
 * Create a mock Crawl entity with realistic data
 */
export const createMockCrawl = (
  overrides: Partial<CrawlEntity> = {},
): CrawlEntity => {
  const url = faker.internet.url();
  const status = faker.helpers.arrayElement(Object.values(CrawlStatus));
  const crawlType = faker.helpers.arrayElement(Object.values(CrawlType));

  return {
    id: faker.string.uuid(),
    url,
    status,
    crawlType,
    title: faker.datatype.boolean({ probability: 0.8 })
      ? faker.lorem.sentence({ min: 3, max: 8 })
      : undefined,
    description: faker.datatype.boolean({ probability: 0.6 })
      ? faker.lorem.paragraph({ min: 1, max: 3 })
      : undefined,
    imageUrl: faker.datatype.boolean({ probability: 0.5 })
      ? faker.image.url()
      : undefined,
    siteName: faker.datatype.boolean({ probability: 0.7 })
      ? faker.company.name()
      : undefined,
    contentType: faker.datatype.boolean({ probability: 0.9 })
      ? faker.helpers.arrayElement([
          'text/html',
          'text/html; charset=utf-8',
          'application/json',
          'text/plain',
          'application/xml',
        ])
      : undefined,
    contentLength: faker.datatype.boolean({ probability: 0.8 })
      ? faker.number.int({ min: 1000, max: 500000 })
      : undefined,
    metadata: faker.datatype.boolean({ probability: 0.7 })
      ? {
          author: faker.person.fullName(),
          keywords: faker.lorem.words(5).split(' '),
          language: faker.helpers.arrayElement(['en', 'vi', 'fr', 'de', 'es']),
          publishedDate: faker.date.recent({ days: 30 }).toISOString(),
          canonical: url,
          robots: 'index,follow',
          viewport: 'width=device-width, initial-scale=1',
        }
      : undefined,
    content:
      crawlType === CrawlType.FULL_CONTENT &&
      faker.datatype.boolean({ probability: 0.3 })
        ? faker.lorem.paragraphs(10)
        : undefined,
    screenshotUrl:
      crawlType === CrawlType.SCREENSHOT &&
      faker.datatype.boolean({ probability: 0.4 })
        ? faker.image.url()
        : undefined,
    crawlDuration:
      status === CrawlStatus.COMPLETED
        ? faker.number.int({ min: 500, max: 30000 })
        : undefined,
    errorMessage:
      status === CrawlStatus.FAILED || status === CrawlStatus.TIMEOUT
        ? faker.helpers.arrayElement([
            'Request timeout',
            'Network error',
            'Invalid response',
            'Access denied',
            'Content too large',
            'Unsupported content type',
          ])
        : undefined,
    retryCount: faker.number.int({ min: 0, max: 3 }),
    lastCrawledAt:
      status !== CrawlStatus.PENDING
        ? faker.date.recent({ days: 7 })
        : undefined,
    expiresAt: faker.datatype.boolean({ probability: 0.3 })
      ? faker.date.future({ years: 1 })
      : undefined,
    isActive: faker.datatype.boolean({ probability: 0.9 }),
    createAt: faker.date.recent({ days: 30 }),
    updateAt: faker.date.recent({ days: 7 }),
    deletedAt: faker.datatype.boolean({ probability: 0.05 })
      ? faker.date.recent({ days: 30 })
      : undefined,
    deleteFlag: faker.datatype.boolean({ probability: 0.05 }),
    ...overrides,
  } as CrawlEntity;
};

/**
 * Create multiple mock crawls
 */
export const createMockCrawls = (
  count: number,
  overrides: Partial<CrawlEntity> = {},
): CrawlEntity[] => {
  return Array.from({ length: count }, () => createMockCrawl(overrides));
};

/**
 * Create crawls with specific status
 */
export const createPendingCrawl = (
  overrides: Partial<CrawlEntity> = {},
): CrawlEntity =>
  createMockCrawl({
    status: CrawlStatus.PENDING,
    crawlDuration: undefined,
    lastCrawledAt: undefined,
    errorMessage: undefined,
    ...overrides,
  });

export const createProcessingCrawl = (
  overrides: Partial<CrawlEntity> = {},
): CrawlEntity =>
  createMockCrawl({
    status: CrawlStatus.PROCESSING,
    lastCrawledAt: new Date(),
    errorMessage: undefined,
    ...overrides,
  });

export const createCompletedCrawl = (
  overrides: Partial<CrawlEntity> = {},
): CrawlEntity =>
  createMockCrawl({
    status: CrawlStatus.COMPLETED,
    title: faker.lorem.sentence(),
    description: faker.lorem.paragraph(),
    imageUrl: faker.image.url(),
    siteName: faker.company.name(),
    crawlDuration: faker.number.int({ min: 1000, max: 10000 }),
    lastCrawledAt: faker.date.recent({ days: 1 }),
    errorMessage: undefined,
    ...overrides,
  });

export const createFailedCrawl = (
  overrides: Partial<CrawlEntity> = {},
): CrawlEntity =>
  createMockCrawl({
    status: CrawlStatus.FAILED,
    errorMessage: faker.helpers.arrayElement([
      'Network error',
      'Access denied',
      'Invalid response',
      'Content too large',
    ]),
    crawlDuration: faker.number.int({ min: 500, max: 5000 }),
    lastCrawledAt: faker.date.recent({ days: 1 }),
    retryCount: faker.number.int({ min: 1, max: 3 }),
    ...overrides,
  });

export const createTimeoutCrawl = (
  overrides: Partial<CrawlEntity> = {},
): CrawlEntity =>
  createMockCrawl({
    status: CrawlStatus.TIMEOUT,
    errorMessage: 'Request timeout',
    crawlDuration: 30000, // Max timeout
    lastCrawledAt: faker.date.recent({ days: 1 }),
    retryCount: faker.number.int({ min: 1, max: 3 }),
    ...overrides,
  });

/**
 * Create crawls with specific types
 */
export const createMetadataCrawl = (
  overrides: Partial<CrawlEntity> = {},
): CrawlEntity =>
  createMockCrawl({
    crawlType: CrawlType.METADATA,
    status: CrawlStatus.COMPLETED,
    title: faker.lorem.sentence(),
    description: faker.lorem.paragraph(),
    imageUrl: faker.image.url(),
    siteName: faker.company.name(),
    content: undefined,
    screenshotUrl: undefined,
    ...overrides,
  });

export const createFullContentCrawl = (
  overrides: Partial<CrawlEntity> = {},
): CrawlEntity =>
  createMockCrawl({
    crawlType: CrawlType.FULL_CONTENT,
    status: CrawlStatus.COMPLETED,
    title: faker.lorem.sentence(),
    description: faker.lorem.paragraph(),
    content: faker.lorem.paragraphs(10),
    contentLength: faker.number.int({ min: 10000, max: 100000 }),
    screenshotUrl: undefined,
    ...overrides,
  });

export const createScreenshotCrawl = (
  overrides: Partial<CrawlEntity> = {},
): CrawlEntity =>
  createMockCrawl({
    crawlType: CrawlType.SCREENSHOT,
    status: CrawlStatus.COMPLETED,
    title: faker.lorem.sentence(),
    description: faker.lorem.paragraph(),
    screenshotUrl: faker.image.url(),
    content: undefined,
    ...overrides,
  });

/**
 * Create crawls for specific user
 */
export const createUserCrawls = (
  user: UserEntity,
  count: number = 5,
): CrawlEntity[] => {
  return createMockCrawls(count, { user });
};

/**
 * Create crawls with different statuses for testing
 */
export const createCrawlsWithMixedStatuses = (
  user: UserEntity,
  count: number = 10,
): CrawlEntity[] => {
  const crawls: CrawlEntity[] = [];
  const statuses = Object.values(CrawlStatus);

  for (let i = 0; i < count; i++) {
    const status = statuses[i % statuses.length];
    crawls.push(createMockCrawl({ user, status }));
  }

  return crawls;
};

/**
 * Create expired crawls
 */
export const createExpiredCrawls = (
  user: UserEntity,
  count: number = 3,
): CrawlEntity[] => {
  return createMockCrawls(count, {
    user,
    expiresAt: faker.date.past({ years: 1 }),
    status: CrawlStatus.COMPLETED,
  });
};

/**
 * Create crawls for different domains
 */
export const createCrawlsForDomains = (
  user: UserEntity,
  domains: string[],
): CrawlEntity[] => {
  return domains.map((domain) =>
    createMockCrawl({
      user,
      url: `https://${domain}${faker.internet.url().split('.com')[1] || ''}`,
      status: CrawlStatus.COMPLETED,
      siteName: domain,
    }),
  );
};

/**
 * Create crawls for performance testing
 */
export const createLargeCrawlSet = (
  user: UserEntity,
  count: number = 1000,
): CrawlEntity[] => {
  const crawls: CrawlEntity[] = [];
  const batchSize = 100;

  for (let i = 0; i < count; i += batchSize) {
    const batch = createMockCrawls(Math.min(batchSize, count - i), { user });
    crawls.push(...batch);
  }

  return crawls;
};

/**
 * Create crawls with specific URLs for testing
 */
export const createCrawlsWithUrls = (
  user: UserEntity,
  urls: string[],
): CrawlEntity[] => {
  return urls.map((url) =>
    createMockCrawl({
      user,
      url,
      status: CrawlStatus.COMPLETED,
    }),
  );
};

/**
 * Create retryable crawls (failed or timeout with low retry count)
 */
export const createRetryableCrawls = (
  user: UserEntity,
  count: number = 5,
): CrawlEntity[] => {
  return Array.from({ length: count }, (_, index) => {
    const status = index % 2 === 0 ? CrawlStatus.FAILED : CrawlStatus.TIMEOUT;
    return createMockCrawl({
      user,
      status,
      retryCount: faker.number.int({ min: 0, max: 2 }), // Less than max retries
      errorMessage:
        status === CrawlStatus.FAILED ? 'Network error' : 'Request timeout',
    });
  });
};

/**
 * Create crawls for search testing
 */
export const createSearchableCrawls = (user: UserEntity): CrawlEntity[] => {
  return [
    createMockCrawl({
      user,
      url: 'https://example.com/blog/javascript-tutorial',
      title: 'Complete JavaScript Tutorial for Beginners',
      description:
        'Learn JavaScript from scratch with this comprehensive tutorial',
      siteName: 'Example Blog',
      status: CrawlStatus.COMPLETED,
    }),
    createMockCrawl({
      user,
      url: 'https://news.example.com/tech/react-updates',
      title: 'Latest React Updates and Features',
      description: 'Discover the newest features in React 18 and beyond',
      siteName: 'Tech News',
      status: CrawlStatus.COMPLETED,
    }),
    createMockCrawl({
      user,
      url: 'https://docs.example.com/api/reference',
      title: 'API Reference Documentation',
      description: 'Complete API documentation with examples',
      siteName: 'Example Docs',
      status: CrawlStatus.COMPLETED,
    }),
    createMockCrawl({
      user,
      url: 'https://github.com/example/project',
      title: 'Example Project Repository',
      description: 'Open source project for web development',
      siteName: 'GitHub',
      status: CrawlStatus.COMPLETED,
    }),
    createMockCrawl({
      user,
      url: 'https://stackoverflow.com/questions/12345',
      title: 'How to handle async operations in JavaScript?',
      description: 'Question about JavaScript async/await patterns',
      siteName: 'Stack Overflow',
      status: CrawlStatus.COMPLETED,
    }),
  ];
};

/**
 * Generate seed crawls for development
 */
export const generateSeedCrawls = (
  users: UserEntity[],
  crawlsPerUser: number = 20,
): CrawlEntity[] => {
  const crawls: CrawlEntity[] = [];

  users.forEach((user) => {
    // Mix of different statuses and types
    const userCrawls = [
      ...createMockCrawls(crawlsPerUser * 0.6, {
        user,
        status: CrawlStatus.COMPLETED,
      }),
      ...createMockCrawls(crawlsPerUser * 0.1, {
        user,
        status: CrawlStatus.PENDING,
      }),
      ...createMockCrawls(crawlsPerUser * 0.1, {
        user,
        status: CrawlStatus.PROCESSING,
      }),
      ...createMockCrawls(crawlsPerUser * 0.15, {
        user,
        status: CrawlStatus.FAILED,
      }),
      ...createMockCrawls(crawlsPerUser * 0.05, {
        user,
        status: CrawlStatus.TIMEOUT,
      }),
    ];

    crawls.push(...userCrawls);
  });

  return crawls;
};

/**
 * Create crawls with realistic metadata
 */
export const createRealisticCrawls = (user: UserEntity): CrawlEntity[] => {
  return [
    createMockCrawl({
      user,
      url: 'https://medium.com/@author/article-title',
      title: 'Building Scalable Web Applications with Node.js',
      description:
        'A comprehensive guide to building scalable web applications using Node.js, Express, and modern JavaScript patterns.',
      imageUrl: 'https://miro.medium.com/max/1200/1*example.jpg',
      siteName: 'Medium',
      contentType: 'text/html; charset=utf-8',
      contentLength: 45000,
      crawlType: CrawlType.METADATA,
      status: CrawlStatus.COMPLETED,
      crawlDuration: 2500,
      metadata: {
        author: 'John Developer',
        publishedDate: '2024-01-15T10:30:00Z',
        keywords: ['nodejs', 'javascript', 'web development', 'scalability'],
        language: 'en',
        canonical: 'https://medium.com/@author/article-title',
      },
    }),
    createMockCrawl({
      user,
      url: 'https://github.com/facebook/react',
      title: 'React - A JavaScript library for building user interfaces',
      description:
        'React makes it painless to create interactive UIs. Design simple views for each state in your application.',
      imageUrl:
        'https://repository-images.githubusercontent.com/10270250/example.png',
      siteName: 'GitHub',
      contentType: 'text/html; charset=utf-8',
      contentLength: 125000,
      crawlType: CrawlType.FULL_CONTENT,
      status: CrawlStatus.COMPLETED,
      crawlDuration: 3200,
      content: faker.lorem.paragraphs(20),
    }),
    createMockCrawl({
      user,
      url: 'https://www.youtube.com/watch?v=example',
      title: 'JavaScript Tutorial for Beginners - Full Course',
      description:
        'Learn JavaScript in this complete tutorial for beginners. This course covers all the fundamentals.',
      imageUrl: 'https://i.ytimg.com/vi/example/maxresdefault.jpg',
      siteName: 'YouTube',
      contentType: 'text/html; charset=utf-8',
      crawlType: CrawlType.SCREENSHOT,
      status: CrawlStatus.COMPLETED,
      screenshotUrl: 'https://screenshots.example.com/youtube-example.png',
      crawlDuration: 5000,
    }),
  ];
};
