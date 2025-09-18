import * as authentication from './error.authentication';
import * as bookmark from './error.bookmark';
import * as collection from './error.collection';
import * as crawl from './error.crawl';
import * as tag from './error.tag';
import * as user from './error.user';

// Export error constants and types
export * from './error-codes.constants';
export * from './error-helper';

// Export individual error modules
export {
  authentication as AuthenticationErrors,
  bookmark as BookmarkErrors,
  collection as CollectionErrors,
  crawl as CrawlErrors,
  tag as TagErrors,
  user as UserErrors,
};

// Legacy export for backward compatibility
export const Errors = {
  ...authentication,
  ...bookmark,
  ...collection,
  ...crawl,
  ...tag,
  ...user,
};

// // Centralized error registry for easy access
// export const ERROR_REGISTRY = {
//   AUTH: authentication,
//   COLLECTION: collection,
//   CRAWL: crawl,
//   USER: user,
// } as const;

// // Type definitions for the error registry
// export type ErrorRegistry = typeof ERROR_REGISTRY;
// export type ErrorDomain = keyof ErrorRegistry;

// // Helper function to get errors by domain
// export function getErrorsByDomain<T extends ErrorDomain>(domain: T): ErrorRegistry[T] {
//   return ERROR_REGISTRY[domain];
// }

// // Helper function to check if an error belongs to a specific domain
// export function isErrorFromDomain(error: any, domain: ErrorDomain): boolean {
//   const domainErrors = ERROR_REGISTRY[domain];
//   return Object.values(domainErrors).includes(error);
// }
