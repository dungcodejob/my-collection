import { ClassProvider, InjectionToken, inject } from "@angular/core";
import { CollectionImplApi } from "./collection-impl.api";
import { CollectionApi } from "./collection.api";

export * from "./collection.store";

const COLLECTION_API = new InjectionToken("collection-api-token");

type ProvideFn = () => ClassProvider;

export const provideCollectionApi: ProvideFn = () => ({
  provide: COLLECTION_API,
  useClass: CollectionImplApi,
});

export const injectCollectionApi = () => inject<CollectionApi>(COLLECTION_API);
