import { ClassProvider, InjectionToken, Type, inject } from "@angular/core";

type InjectFn<T> = () => T;
type ProviderFn = () => ClassProvider;

export function createInjectionApiToken<T>(
  apiService: Type<T>
): [InjectFn<T>, ProviderFn];

export function createInjectionApiToken<T>(
  apiService: Type<T>,
  mockApiService: Type<T>
): [InjectFn<T>, ProviderFn, ProviderFn];
export function createInjectionApiToken<T>(
  apiService: Type<T>,
  mockApiService?: Type<T>
): [InjectFn<T>, ProviderFn] | [InjectFn<T>, ProviderFn, ProviderFn] {
  const token = new InjectionToken(`API Token for${apiService.name}`);

  const injectApi = () => inject<T>(token);
  const provideApi = (): ClassProvider => ({ provide: token, useClass: apiService });

  if (mockApiService) {
    const provideMockApi = (): ClassProvider => ({
      provide: token,
      useClass: mockApiService,
    });
    return [injectApi, provideApi, provideMockApi];
  }

  return [injectApi, provideApi];
}
