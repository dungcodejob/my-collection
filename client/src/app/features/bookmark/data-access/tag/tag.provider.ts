import { createInjectionApiToken } from "@shared/utils";
import { TagImplApi } from "./tag-impl.api";
import { TagMockApi } from "./tag-mock.api";
import { TagApi } from "./tag.api";

export const [injectTagApi, provideTagApi, provideTagMockApi] =
  createInjectionApiToken<TagApi>(TagImplApi, TagMockApi);
