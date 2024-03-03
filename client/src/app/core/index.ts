import { provideHttpClient } from "@angular/common/http";
import { makeEnvironmentProviders } from "@angular/core";
import { provideConfigInitializer } from "./config";

export const provideCore = () =>
  makeEnvironmentProviders([provideHttpClient(), provideConfigInitializer()]);
