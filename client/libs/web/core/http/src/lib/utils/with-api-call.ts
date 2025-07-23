import { computed, inject } from "@angular/core";
import { rxMethod } from "@ngrx/signals/rxjs-interop";
import { patchState, signalStoreFeature, type, withComputed, withMethods, withState } from "@ngrx/signals";
import { pipe, switchMap, tap, catchError, of, Observable } from "rxjs";
import { SuccessResponseDto } from "../models/response.dto";

/**
 * Type helper để tạo state keys cho API call
 */
type ApiCallState<TName extends string> = {
  [K in `${TName}Loading`]: boolean;
} & {
  [K in `${TName}Data`]: any;
} & {
  [K in `${TName}Error`]: string | null;
};

/**
 * Type helper để tạo computed signals cho API call
 */
type ApiCallComputed<TName extends string, TData> = {
  [K in `${TName}IsLoading`]: () => boolean;
} & {
  [K in `${TName}HasData`]: () => boolean;
} & {
  [K in `${TName}HasError`]: () => boolean;
} & {
  [K in `${TName}IsIdle`]: () => boolean;
};

/**
 * Type helper để tạo methods cho API call
 */
type ApiCallMethods<TName extends string, TParams, TData> = {
  [K in TName]: (params: TParams) => void;
} & {
  [K in `clear${Capitalize<TName>}`]: () => void;
} & {
  [K in `reset${Capitalize<TName>}`]: () => void;
};

/**
 * Options cho withApiCall feature
 */
export interface WithApiCallOptions<TParams, TData> {
  /**
   * Function để thực hiện API call
   * @param params - Parameters cho API call
   * @returns Observable với SuccessResponseDto<TData>
   */
  apiCall: (params: TParams) => Observable<SuccessResponseDto<TData>>;
  
  /**
   * Optional callback khi API call thành công
   */
  onSuccess?: (data: TData, params: TParams) => void;
  
  /**
   * Optional callback khi API call thất bại
   */
  onError?: (error: string, params: TParams) => void;
  
  /**
   * Optional callback trước khi bắt đầu API call
   */
  onStart?: (params: TParams) => void;
  
  /**
   * Có tự động clear error khi bắt đầu call mới không
   * @default true
   */
  clearErrorOnStart?: boolean;
  
  /**
   * Có tự động clear data khi bắt đầu call mới không
   * @default false
   */
  clearDataOnStart?: boolean;
}

/**
 * Signal store feature để xử lý API calls với state management tự động
 * 
 * @example
 * ```typescript
 * // Định nghĩa store với API call
 * export const UserStore = signalStore(
 *   withState({ users: [] as User[] }),
 *   withApiCall('getUser', {
 *     apiCall: (params: { id: string }) => userApi.getUser(params.id),
 *     onSuccess: (user, params) => console.log('User loaded:', user.name),
 *     onError: (error, params) => console.error('Failed to load user:', error)
 *   }),
 *   withApiCall('getUsers', {
 *     apiCall: () => userApi.getUsers(),
 *     clearDataOnStart: true
 *   })
 * );
 * 
 * // Sử dụng trong component
 * const userStore = inject(UserStore);
 * 
 * // State signals
 * const getUserLoading = userStore.getUserLoading();
 * const getUserData = userStore.getUserData();
 * const getUserError = userStore.getUserError();
 * 
 * // Computed signals
 * const getUserIsLoading = userStore.getUserIsLoading();
 * const getUserHasData = userStore.getUserHasData();
 * const getUserHasError = userStore.getUserHasError();
 * const getUserIsIdle = userStore.getUserIsIdle();
 * 
 * // Methods
 * userStore.getUser({ id: '123' });
 * userStore.clearGetUser();
 * userStore.resetGetUser();
 * ```
 */
export function withApiCall<
  TName extends string,
  TParams = void,
  TData = any
>(
  name: TName,
  options: WithApiCallOptions<TParams, TData>
) {
  const loadingKey = `${name}Loading` as const;
  const dataKey = `${name}Data` as const;
  const errorKey = `${name}Error` as const;
  
  const isLoadingKey = `${name}IsLoading` as const;
  const hasDataKey = `${name}HasData` as const;
  const hasErrorKey = `${name}HasError` as const;
  const isIdleKey = `${name}IsIdle` as const;
  
  const clearMethodKey = `clear${name.charAt(0).toUpperCase() + name.slice(1)}` as const;
  const resetMethodKey = `reset${name.charAt(0).toUpperCase() + name.slice(1)}` as const;

  return signalStoreFeature(
    // State
    withState({
      [loadingKey]: false,
      [dataKey]: null,
      [errorKey]: null
    } as ApiCallState<TName>),
    
    // Computed signals
    withComputed((state: any) => ({
      [isLoadingKey]: computed(() => state[loadingKey]()),
      [hasDataKey]: computed(() => state[dataKey]() !== null),
      [hasErrorKey]: computed(() => state[errorKey]() !== null),
      [isIdleKey]: computed(() => !state[loadingKey]() && state[dataKey]() === null && state[errorKey]() === null)
    } as ApiCallComputed<TName, TData>)),
    
    // Methods
    withMethods((store: any) => {
      const apiMethod = rxMethod<TParams>(
        pipe(
          tap((params) => {
            // Execute onStart callback
            if (options.onStart) {
              options.onStart(params);
            }
            
            // Update loading state and optionally clear error/data
            patchState(store, {
              [loadingKey]: true,
              ...(options.clearErrorOnStart !== false ? { [errorKey]: null } : {}),
              ...(options.clearDataOnStart === true ? { [dataKey]: null } : {})
            });
          }),
          switchMap((params) =>
            options.apiCall(params).pipe(
              tap((response) => {
                // Update state with success data
                patchState(store, {
                  [loadingKey]: false,
                  [dataKey]: response.result,
                  [errorKey]: null
                });
                
                // Execute onSuccess callback
                if (options.onSuccess) {
                  options.onSuccess(response.result, params);
                }
              }),
              catchError((error) => {
                const errorMessage = error.error?.message || error.message || 'An error occurred';
                
                // Update state with error
                patchState(store, {
                  [loadingKey]: false,
                  [errorKey]: errorMessage
                });
                
                // Execute onError callback
                if (options.onError) {
                  options.onError(errorMessage, params);
                }
                
                return of(null);
              })
            )
          )
        )
      );
      
      const clearMethod = () => {
        patchState(store, {
          [errorKey]: null
        });
      };
      
      const resetMethod = () => {
        patchState(store, {
          [loadingKey]: false,
          [dataKey]: null,
          [errorKey]: null
        });
      };
      
      return {
        [name]: apiMethod,
        [clearMethodKey]: clearMethod,
        [resetMethodKey]: resetMethod
      } as ApiCallMethods<TName, TParams, TData>;
    })
  );
}

/**
 * Helper type để extract API call state từ store
 */
export type ExtractApiCallState<T> = T extends ApiCallState<infer TName> ? TName : never;

/**
 * Utility function để tạo multiple API calls cùng lúc
 * 
 * @example
 * ```typescript
 * export const UserStore = signalStore(
 *   withState({ users: [] as User[] }),
 *   ...withMultipleApiCalls({
 *     getUser: {
 *       apiCall: (params: { id: string }) => userApi.getUser(params.id)
 *     },
 *     getUsers: {
 *       apiCall: () => userApi.getUsers()
 *     },
 *     createUser: {
 *       apiCall: (params: CreateUserRequest) => userApi.createUser(params),
 *       clearDataOnStart: true
 *     }
 *   })
 * );
 * ```
 */
export function withMultipleApiCalls<
  TApiCalls extends Record<string, WithApiCallOptions<any, any>>
>(apiCalls: TApiCalls) {
  return Object.entries(apiCalls).map(([name, options]) =>
    withApiCall(name, options)
  );
}

/**
 * Type helper để tạo type-safe API call definitions
 */
export type ApiCallDefinition<TParams, TData> = WithApiCallOptions<TParams, TData>;

/**
 * Factory function để tạo API call definition với type safety
 */
export function defineApiCall<TParams, TData>(
  options: WithApiCallOptions<TParams, TData>
): ApiCallDefinition<TParams, TData> {
  return options;
}


