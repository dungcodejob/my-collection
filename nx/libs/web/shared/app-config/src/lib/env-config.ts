export enum EnvironmentType {
  Dev = 'dev',
  Staging = 'staging',
  Prod = 'prod',
}

export enum Lang {
  EN = 'en',
  VI = 'vi',
}

export interface EnvConfig {
  env: EnvironmentType;
  development: boolean;
  baseUrl: string;
  defaultLanguage: string;
}
