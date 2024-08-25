import { Provider, isDevMode } from "@angular/core";
import { createInjectionApiToken } from "@shared/utils";
import { TagImplApi } from "./tag-impl.api";
import { TagMockApi } from "./tag-mock.api";
import { TagApi } from "./tag.api";
import { TagFacade } from "./tag.facade";
import { TagStore } from "./tag.store";

export const [injectTagApi, provideTagApi, provideTagMockApi] =
  createInjectionApiToken<TagApi>(TagImplApi, TagMockApi);

export const provideTag = (): Provider => {
  const provideApi = isDevMode() ? provideTagMockApi : provideTagApi;
  return [provideApi(), TagStore, TagFacade];
};
