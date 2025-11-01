import { Status } from "@client/web-shared-utils";
import { finalize, Observable } from "rxjs";
import { ResponseDto, UnwrapResponseHttp } from "../models";
import { tapError } from "./tap-error";
import { tapResponseData } from "./tap-response-data";

type ApiHandleOptions<TData, TError> = {
  successFn: (data: TData) => void;
  errorFn?: (error: TError) => void;
  statusFn?: (status: Status) => void;
  finalFn?: () => void;
};

/**
 * A comprehensive RxJS operator for handling API calls with ResponseDto objects.
 * This operator provides a unified way to handle success, error, and status updates
 * for HTTP requests that return ResponseDto-wrapped responses.
 *
 * The operator automatically:
 * - Sets status to "pending" when the operation starts
 * - Extracts and processes successful response data
 * - Sets status to "fulfilled" on success
 * - Handles errors and sets status to error state
 * - Calls appropriate callback functions based on the response outcome
 *
 * @template T The ResponseDto type that extends ResponseDto<K>
 * @template K The type of the actual data payload within the ResponseDto
 * @template TError The type of error object expected in error scenarios (defaults to unknown)
 *
 * @param options Configuration object containing callback functions
 * @param options.successFn Required callback function called with unwrapped data when API call succeeds
 * @param options.errorFn Optional callback function called with error object when API call fails
 * @param options.statusFn Optional callback function called with status updates ("pending", "fulfilled", or error object)
 *
 * @returns An RxJS operator function that can be applied to Observable<T> and returns Observable<T>
 *
 * @example
 * // Basic usage with success and error handling
 * httpClient.get<ResponseDto<User>>('/api/users/1').pipe(
 *   tapHandleApi({
 *     successFn: (user) => {
 *       console.log('User loaded:', user);
 *       this.userSignal.set(user);
 *     },
 *     errorFn: (error) => {
 *       console.error('Failed to load user:', error);
 *       this.showErrorMessage(error.message);
 *     }
 *   })
 * ).subscribe();
 *
 * @example
 * // Usage with status tracking for loading states
 * httpClient.post<ResponseDto<CreateUserResponse>>('/api/users', userData).pipe(
 *   tapHandleApi({
 *     successFn: (response) => {
 *       this.users.update(users => [...users, response.user]);
 *       this.showSuccessMessage('User created successfully');
 *     },
 *     errorFn: (error) => {
 *       this.showErrorMessage('Failed to create user');
 *     },
 *     statusFn: (status) => {
 *       if (status === 'pending') {
 *         this.isLoading.set(true);
 *       } else if (status === 'fulfilled') {
 *         this.isLoading.set(false);
 *       } else {
 *         this.isLoading.set(false);
 *         this.hasError.set(true);
 *       }
 *     }
 *   })
 * ).subscribe();
 */
export function tapHandleApi<T extends ResponseDto<K>, K, TError = unknown>(
  options: ApiHandleOptions<UnwrapResponseHttp<T>, TError>
): (source: Observable<T>) => Observable<T> {
  const { successFn, errorFn, statusFn, finalFn } = options;

  if (statusFn) {
    statusFn("pending");
  }

  return source =>
    source.pipe(
      tapResponseData(data => {
        if (statusFn) {
          statusFn("fulfilled");
        }
        successFn(data);
      }),
      tapError(error => {
        console.error("Error in tapHandleApi:", error);

        if (errorFn) {
          errorFn(error as TError);
        }

        if (statusFn) {
          statusFn({ error: error });
        }
      }),
      finalize(() => {
        if (finalFn) {
          finalFn();
        }
      })
    );
}
