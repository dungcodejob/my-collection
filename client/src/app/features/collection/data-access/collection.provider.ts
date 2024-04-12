import { ClassProvider, InjectionToken, inject } from "@angular/core";
import { CollectionImplApi } from "./collection-impl.api";
import { CollectionMockApi } from "./collection-mock.api";
import { CollectionApi } from "./collection.api";

const COLLECTION_API = new InjectionToken<CollectionApi>("collection-api-token");

export const injectCollectionApi = () => inject(COLLECTION_API);

export const provideCollectionApi = (): ClassProvider => ({
  provide: COLLECTION_API,
  useClass: CollectionImplApi,
});

export const provideCollectionMockApi = (): ClassProvider => ({
  provide: COLLECTION_API,
  useClass: CollectionMockApi,
});
