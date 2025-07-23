import { HttpEvent } from "@angular/common/http";
import { inject } from "@angular/core";
import { patchState, signalStoreFeature, type } from "@ngrx/signals";
import { eventGroup, Events, withEffects } from "@ngrx/signals/events";
import { exhaustMap, Observable, tap } from "rxjs";
import { SuccessResponseDto } from "../models/response.dto";
import {
  handleHttpResponseForNgrx,
  mapToErrorAction,
  mapToSuccessAction,
  mapToUploadProgressAction
} from "./index";

/**
 * VÍ DỤ SỬ DỤNG NGRX OPERATORS - GIẢI QUYẾT VẤN ĐỀ ACTION RETURN
 *
 * Các operators mới này được thiết kế đặc biệt cho NgRx Effects
 * và luôn trả về actions thay vì EMPTY
 */

// ===== TYPES =====
interface User {
  id: string;
  name: string;
  email: string;
}

interface UserProfile {
  id: string;
  userId: string;
  bio: string;
  avatar: string;
}

interface UserState {
  users: User[];
  loading: boolean;
  error: string | null;
  validationErrors: Record<string, string[]> | null;
  uploadProgress: number;
}

abstract class UserApi {
  abstract getUsers(): Observable<HttpEvent<SuccessResponseDto<User[]>>>;
  abstract createUser(user: Partial<User>): any;
  abstract updateUser(id: string, user: Partial<User>): any;
  abstract deleteUser(id: string): any;
  abstract uploadAvatar(userId: string, file: File): any;
  abstract updateUserWithAvatar(userId: string, userData: Partial<User>, avatarFile: File): any;
  abstract createProfile(userId: string, profileData: Partial<UserProfile>): any;
}

abstract class NotificationService {
  abstract showSuccess(message: string): void;
  abstract showError(message: string): void;
}

// ===== EVENT DEFINITIONS =====
export const userEvents = eventGroup({
  source: "User",
  events: {
    // Load users
    loadUsers: type<void>(),
    loadUsersSuccess: type<{ users: User[] }>(),
    loadUsersFailure: type<{ error: string }>(),

    // Create user
    createUser: type<{ user: Omit<User, 'id'> }>(),
    createUserSuccess: type<{ user: User }>(),
    createUserFailure: type<{ error: string }>(),

    // Upload avatar
    uploadAvatar: type<{ userId: string; file: File }>(),
    uploadAvatarProgress: type<{ progress: number }>(),
    uploadAvatarSuccess: type<{ userId: string; avatarUrl: string }>(),
    uploadAvatarFailure: type<{ error: string }>(),

    // Validation errors
    validationError: type<{ errors: Record<string, string[]> }>(),
  }
});

// ===== VÍ DỤ 1: SỬ DỤNG mapHttpResponse (SIMPLE) =====
export function withSimpleUserEffects() {
  return signalStoreFeature(
    { state: type<UserState>() },
    withEffects((store, events = inject(Events), userApi = inject(UserApi)) => {
      return {
        // ✅ ĐÚNG: Effect luôn trả về action
        loadUsers: events.on(userEvents.loadUsers).pipe(
          tap(() => patchState(store, { loading: true, error: null })),

          exhaustMap(() =>
            userApi.getUsers().pipe(
              mapToSuccessAction((users) => userEvents.loadUsersSuccess({ users: users ?? [] }))
            )
          )
        ),
      };
    })
  );
}

// ===== VÍ DỤ 2: SỬ DỤNG handleHttpResponseForNgrx (ADVANCED) =====
export function withAdvancedUserEffects() {
  return signalStoreFeature(
    { state: type<UserState>() },
    withEffects((store, events = inject(Events), userApi = inject(UserApi)) => {
      return {
        // ✅ ĐÚNG: Effect với validation error handling
        createUser: events.on(userEvents.createUser).pipe(
          exhaustMap(({ payload }) =>
            (userApi as UserApi).createUser(payload.user).pipe(
              // Operator này handle cả success, validation errors, và general errors
              handleHttpResponseForNgrx(
                // Success action creator
                (user: User) => userEvents.createUserSuccess({ user }),

                // Error action creator
                (payload: { error: string; }) => userEvents.createUserFailure(payload),

                // Validation error action creator
                (payload: { errors: Record<string, string[]>; }) => userEvents.validationError(payload),

                // Callback cho side effects
                (user: User) => {
                  console.log('User created:', user);
                  patchState(store, {
                    users: [...store.users(), user],
                    validationErrors: null
                  });
                }
              )
            )
          )
        ),
      };
    })
  );
}

// ===== VÍ DỤ 3: SỬ DỤNG INDIVIDUAL OPERATORS =====
export function withCustomUserEffects() {
  return signalStoreFeature(
    { state: type<UserState>() },
    withEffects((store, events = inject(Events), userApi = inject(UserApi)) => {
      return {
        // ✅ ĐÚNG: Sử dụng individual operators cho custom logic
        uploadAvatar: events.on(userEvents.uploadAvatar).pipe(
          tap(() => patchState(store, { uploadProgress: 0 })),

          exhaustMap(({ payload }) =>
            (userApi as UserApi).uploadAvatar(payload.userId, payload.file).pipe(
              // Track upload progress
              mapToUploadProgressAction(
                (payload) => userEvents.uploadAvatarProgress(payload),
                (progress) => {
                  patchState(store, { uploadProgress: progress });
                }
              ),

              // Map success response to action
              mapToSuccessAction(
                (data: { userId: string; avatarUrl: string }) => userEvents.uploadAvatarSuccess(data),
                (response: { avatarUrl: string }) => {
                  console.log('Avatar uploaded:', response);
                  patchState(store, { uploadProgress: 100 });
                  // Return the data for the action
                  return { userId: payload.userId, avatarUrl: response.avatarUrl };
                }
              ),

              // Handle errors
              mapToErrorAction(
                (payload) => userEvents.uploadAvatarFailure(payload)
              )
            )
          )
        ),
      };
    })
  );
}

// ===== VÍ DỤ 4: SO SÁNH CÁCH CŨ VS CÁCH MỚI =====

// ❌ CÁCH CŨ - KHÔNG HOẠT ĐỘNG VỚI NGRX EFFECTS
/*
loadUsers: events.on(userEvents.loadUsers).pipe(
  exhaustMap(() =>
    userApi.getUsers().pipe(
      tapResponseData((users) => {
        patchState(store, { users });
      }),
      tapError((error) => {
        patchState(store, { error: error.message });
      })
      // ❌ Vấn đề: tapError return EMPTY, không có action nào được dispatch
    )
  )
),
*/

// ✅ CÁCH MỚI - HOẠT ĐỘNG ĐÚNG VỚI NGRX EFFECTS
/*
loadUsers: events.on(userEvents.loadUsers).pipe(
  exhaustMap(() =>
    userApi.getUsers().pipe(
      mapHttpResponse(
        (users: User[]) => userEvents.loadUsersSuccess({ users }),
        (payload) => userEvents.loadUsersFailure(payload),
        (users) => patchState(store, { users })
      )
      // ✅ Luôn trả về action (success hoặc error)
    )
  )
),
*/

/**
 * ===== TÓM TẮT CÁC OPERATORS MỚI =====
 *
 * 1. mapHttpResponse<T, K>():
 *    - Cho basic success/error handling
 *    - Luôn trả về action
 *    - Đơn giản và dễ sử dụng
 *
 * 2. handleHttpResponseForNgrx<T, K>():
 *    - Cho advanced handling (bao gồm validation errors)
 *    - Handle HTTP 400 validation errors riêng biệt
 *    - Luôn trả về action
 *
 * 3. mapToErrorAction():
 *    - Catch general HTTP errors và dispatch error action
 *    - Thay thế cho tapError khi cần return action
 *
 * 4. mapToValidationAction():
 *    - Catch HTTP 400 validation errors
 *    - Dispatch validation error action
 *
 * 5. mapToSuccessAction():
 *    - Map successful response to success action
 *    - Extract data và dispatch action
 *
 * 6. mapToUploadProgressAction():
 *    - Track upload progress
 *    - Không ảnh hưởng đến action flow
 *
 * ===== BEST PRACTICES =====
 *
 * 1. Luôn sử dụng action creators có type safety
 * 2. Handle side effects trong options callbacks
 * 3. Sử dụng mapHttpResponse cho simple cases
 * 4. Sử dụng handleHttpResponseForNgrx cho complex cases
 * 5. Combine với patchState để update store state
 * 6. Log errors và success trong callbacks
 */
