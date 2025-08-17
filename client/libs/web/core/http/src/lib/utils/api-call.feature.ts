import { Signal, computed } from "@angular/core";
import { capitalize } from "@client/web-shared-utils";
import {
  EmptyFeatureResult,
  SignalStoreFeature,
  patchState,
  signalStoreFeature,
  withComputed,
  withMethods,
  withState,
} from "@ngrx/signals";
import { rxMethod } from "@ngrx/signals/rxjs-interop";
import { switchMap } from "rxjs";
import {
  ApiCallConfig,
  ApiCallSignals,
  ApiCallState,
  ApiCallStatus,
  NamedApiCallConfig,
  NamedApiCallSignals,
  NamedApiCallState,
} from "./api-call-name.type";
import { tapError } from "./tap-error";
import { tapResponseData } from "./tap-response-data";

// Helper function to get state and signal keys
function getApiCallKeys(name?: string): {
  dataKey: string;
  statusKey: string;
  isPendingKey: string;
  isFulfilledKey: string;
  errorKey: string;
  callMethodKey: string;
} {
  return {
    dataKey: name ? `${name}Data` : "data",
    statusKey: name ? `${name}Status` : "status",
    isPendingKey: name ? `$is${capitalize(name)}Pending` : "$isPending",
    isFulfilledKey: name ? `$is${capitalize(name)}Fulfilled` : "$isFulfilled",
    errorKey: name ? `$${name}Error` : "$error",
    callMethodKey: name ? `call${capitalize(name)}` : "call",
  };
}

/**
 * A powerful NgRx SignalStore feature that provides comprehensive API call management with automatic state handling.
 * This feature integrates seamlessly with Angular's signal-based reactive state management, offering both unnamed
 * and named API call configurations for maximum flexibility.
 *
 * **Key Features:**
 * - Automatic status management (idle, pending, fulfilled, error)
 * - Data transformation and caching capabilities
 * - Success and error callback handling
 * - Type-safe signal-based state access
 * - Support for both single and multiple named API calls
 * - Built-in error handling with custom error callbacks
 * - Reactive method generation using rxMethod
 *
 * **State Management:**
 * - `data`: Stores the transformed API response data
 * - `status`: Tracks the current API call status
 * - `$isPending`: Computed signal indicating loading state
 * - `$isFulfilled`: Computed signal indicating success state
 * - `$error`: Computed signal containing error information
 *
 * @template TRequest The type of the request payload sent to the API
 * @template TRaw The raw response type returned from the API before transformation
 * @template TData The final data type after transformation (defaults to TRaw)
 * @template Name The name identifier for named API calls (string literal type)
 *
 * @param config Configuration object containing API call settings
 * @param config.requestFn Function that performs the actual API call and returns an Observable
 * @param config.transformFn Optional function to transform raw API response data
 * @param config.successFn Optional callback function called when API call succeeds
 * @param config.errorFn Optional callback function called when API call fails
 * @param config.name Optional name for the API call (creates named methods and state)
 *
 * @returns A SignalStore feature that adds API call state, computed signals, and methods
 *
 * @example
 * // Basic unnamed API call
 * const UserStore = signalStore(
 *   { providedIn: 'root' },
 *   withApiCall<CreateUserRequest, UserDto, User>({
 *     requestFn: (request: CreateUserRequest) => {
 *       const http = inject(HttpClient);
 *       return http.post<ResponseDto<UserDto>>('/api/users', request);
 *     },
 *     transformFn: (dto: UserDto): User => ({
 *       id: dto.id,
 *       name: dto.full_name,
 *       email: dto.email_address,
 *     }),
 *     successFn: (user: User) => {
 *       console.log('User created:', user);
 *     },
 *     errorFn: (error) => {
 *       console.error('Failed to create user:', error);
 *     }
 *   })
 * );
 *
 * @example
 * // Usage in component with unnamed API call
 * @Component({
 *   selector: 'app-user-form',
 *   template: `
 *     <form (ngSubmit)="createUser()">
 *       @if (userStore.$isPending()) {
 *         <div>Creating user...</div>
 *       }
 *       @if (userStore.$error()) {
 *         <div class="error">Error: {{ userStore.$error() }}</div>
 *       }
 *       @if (userStore.$isFulfilled() && userStore.data()) {
 *         <div class="success">User created: {{ userStore.data()?.name }}</div>
 *       }
 *       <button type="submit" [disabled]="userStore.$isPending()">Create User</button>
 *     </form>
 *   `
 * })
 * export class UserFormComponent {
 *   protected readonly userStore = inject(UserStore);
 *
 *   createUser(): void {
 *     this.userStore.call({
 *       name: 'John Doe',
 *       email: 'john@example.com'
 *     });
 *   }
 * }
 *
 * @example
 * // Named API calls for multiple endpoints
 * const UserManagementStore = signalStore(
 *   { providedIn: 'root' },
 *   withApiCall<CreateUserRequest, UserDto, User, 'createUser'>({
 *     name: 'createUser',
 *     requestFn: (request: CreateUserRequest) => {
 *       const http = inject(HttpClient);
 *       return http.post<ResponseDto<UserDto>>('/api/users', request);
 *     },
 *     transformFn: (dto: UserDto): User => ({ ...dto }),
 *     successFn: (user: User) => {
 *       // Handle success
 *     }
 *   }),
 *   withApiCall<number, UserDto, User, 'getUser'>({
 *     name: 'getUser',
 *     requestFn: (id: number) => {
 *       const http = inject(HttpClient);
 *       return http.get<ResponseDto<UserDto>>(`/api/users/${id}`);
 *     },
 *     transformFn: (dto: UserDto): User => ({ ...dto })
 *   })
 * );
 *
 * @example
 * // Usage with named API calls
 * @Component({
 *   selector: 'app-user-management',
 *   template: `
 *     <div>
 *       @if (store.$isCreateUserPending()) {
 *         <div>Creating user...</div>
 *       }
 *       @if (store.$isGetUserPending()) {
 *         <div>Loading user...</div>
 *       }
 *       <button (click)="createUser()" [disabled]="store.$isCreateUserPending()">Create</button>
 *       <button (click)="loadUser(1)" [disabled]="store.$isGetUserPending()">Load User</button>
 *     </div>
 *   `
 * })
 * export class UserManagementComponent {
 *   protected readonly store = inject(UserManagementStore);
 *
 *   createUser(): void {
 *     this.store.callCreateUser({ name: 'Jane', email: 'jane@example.com' });
 *   }
 *
 *   loadUser(id: number): void {
 *     this.store.callGetUser(id);
 *   }
 * }
 *
 * @example
 * // Advanced usage with data transformation and caching
 * const ProductStore = signalStore(
 *   { providedIn: 'root' },
 *   withApiCall<void, ProductDto[], Product[], 'loadProducts'>({
 *     name: 'loadProducts',
 *     requestFn: () => {
 *       const http = inject(HttpClient);
 *       return http.get<ResponseDto<ProductDto[]>>('/api/products');
 *     },
 *     transformFn: (dtos: ProductDto[], currentData: Product[] | null): Product[] => {
 *       // Transform and merge with existing data
 *       const products = dtos.map(dto => ({
 *         id: dto.id,
 *         name: dto.product_name,
 *         price: dto.price_cents / 100,
 *         category: dto.category_info
 *       }));
 *
 *       // Merge with existing data to maintain cache
 *       return currentData ? [...currentData, ...products] : products;
 *     },
 *     successFn: (products: Product[]) => {
 *       // Analytics or side effects
 *       console.log(`Loaded ${products.length} products`);
 *     },
 *     errorFn: (error) => {
 *       // Error handling
 *       console.error('Failed to load products:', error);
 *     }
 *   })
 * );
 */
export function withApiCall<TRequest = unknown, TRaw = unknown, TData = TRaw>(
  config: ApiCallConfig<TRequest, TRaw, TData>
): SignalStoreFeature<
  EmptyFeatureResult,
  EmptyFeatureResult & {
    state: ApiCallState<TData>;
    props: ApiCallSignals<TData> & {
      call: (request: TRequest) => void;
    };
  }
>;

export function withApiCall<
  Name extends string,
  TRequest = unknown,
  TRaw = unknown,
  TData = TRaw,
>(
  config: NamedApiCallConfig<TRequest, TRaw, TData, Name>
): SignalStoreFeature<
  EmptyFeatureResult,
  EmptyFeatureResult & {
    state: NamedApiCallState<Name, TData>;
    props: NamedApiCallSignals<Name, TData>;
    methods: {
      [key in `call${Capitalize<Name>}`]: (request: TRequest) => void;
    };
  }
>;

export function withApiCall<
  Name extends string,
  TRequest = unknown,
  TRaw = unknown,
  TData = TRaw,
>(
  config:
    | ApiCallConfig<TRequest, TRaw, TData>
    | NamedApiCallConfig<TRequest, TRaw, TData, Name>
): SignalStoreFeature {
  const { requestFn, transformFn, name } = config as NamedApiCallConfig<
    TRequest,
    TRaw,
    TData,
    Name
  >;
  const keys = getApiCallKeys(name);

  return signalStoreFeature(
    // Initialize state
    withState(() => ({
      [keys.dataKey]: null as TData,
      [keys.statusKey]: "idle" as ApiCallStatus,
    })),

    // Add computed signals
    withComputed((store: Record<string, Signal<unknown>>) => {
      const $status = store[keys.statusKey] as Signal<ApiCallStatus>;
      const $data = store[keys.dataKey] as Signal<TData | null>;

      return {
        [keys.dataKey]: $data,
        [keys.statusKey]: $status,
        [keys.isPendingKey]: computed(() => $status() === "pending"),
        [keys.isFulfilledKey]: computed(() => $status() === "fulfilled"),
        [keys.errorKey]: computed(() => {
          const status = $status();
          return typeof status === "object" ? status.error : null;
        }),
      };
    }),

    // Add methods
    withMethods(store => {
      const callMethod = rxMethod<TRequest>(
        switchMap((request: TRequest) => {
          // Set pending state
          patchState(store, {
            [keys.statusKey]: "pending",
          });

          return requestFn(request).pipe(
            tapResponseData(data => {
              const $preData = store[keys.dataKey] as Signal<TData | null>;
              const transformedData = transformFn ? transformFn(data, $preData()) : data;
              config.successFn?.(transformedData as TData);
              patchState(store, {
                [keys.dataKey]: transformedData as TData,
              });
            }),
            tapError(error => {
              config.errorFn?.(error);
              patchState(store, {
                [keys.statusKey]: { error },
              });
            })
          );
        })
      );

      return {
        [keys.callMethodKey]: callMethod,
      };
    })
  );
}
