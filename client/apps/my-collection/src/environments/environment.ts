import { EnvConfig, EnvironmentType, Lang } from "@nx/web-shared-app-config";

export const environment: EnvConfig = {
  env: EnvironmentType.Dev,
  development: false,
  baseUrl: "http://localhost:3000/api",
  defaultLanguage: Lang.VI,
};
