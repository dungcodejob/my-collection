import { Provider, isDevMode } from "@angular/core";
import { createInjectionApiToken } from "@shared/utils";
import { CollectionImplApi } from "./collection-impl.api";
import { CollectionMockApi } from "./collection-mock.api";
import { CollectionApi } from "./collection.api";
import { CollectionFacade } from "./collection.facade";

export const [injectCollectionApi, provideCollectionApi, provideCollectionMockApi] =
  createInjectionApiToken<CollectionApi>(CollectionImplApi, CollectionMockApi);

export const provideCollection = (): Provider => {
  const provideApi = isDevMode() ? provideCollectionMockApi : provideCollectionApi;
  return [provideApi(), CollectionFacade];
};
