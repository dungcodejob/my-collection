import { createInjectionApiToken } from "@shared/utils";
import { CollectionImplApi } from "./collection-impl.api";
import { CollectionMockApi } from "./collection-mock.api";
import { CollectionApi } from "./collection.api";

export const [injectCollectionApi, provideCollectionApi, provideCollectionMockApi] =
  createInjectionApiToken<CollectionApi>(CollectionImplApi, CollectionMockApi);
