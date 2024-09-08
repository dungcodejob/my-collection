import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
} from "@ngrx/signals";
import { rxMethod } from "@ngrx/signals/rxjs-interop";
import { debouncedSignal } from "@shared/utils";
import { tap } from "rxjs";
import { Status } from "./status/status-name.type";
import { withStatus } from "./status/status.feature";

interface AppState {
  loading: boolean;
}

const initialState: AppState = { loading: false };

export const AppFacade = signalStore(
  { providedIn: "root" },
  withState<AppState>(initialState),
  withStatus(),
  withComputed(store => {
    return {
      $loading: debouncedSignal(store.$isPending),
    };
  }),
  withMethods(store => {
    return {
      setStatus: rxMethod<Status>(value$ => {
        return value$.pipe(tap(value => patchState(store, { status: value })));
      }),
    };
  })
);
