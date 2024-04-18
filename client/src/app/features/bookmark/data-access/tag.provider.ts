import { ClassProvider, InjectionToken, inject } from "@angular/core";
import { TagImplApi } from "./tag-impl.api";
import { TagMockApi } from "./tag-mock.api";
import { TagApi } from "./tag.api";

const TAG_API = new InjectionToken("tag-api-token");

export const injectTagApi = () => inject<TagApi>(TAG_API);

export const provideTagApi = (): ClassProvider => ({
  provide: TAG_API,
  useClass: TagImplApi,
});

export const provideTagMockApi = (): ClassProvider => ({
  provide: TAG_API,
  useClass: TagMockApi,
});
