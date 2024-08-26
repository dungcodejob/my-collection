import { patchState, signalStore, withMethods, withState } from "@ngrx/signals";
import { rxMethod } from "@ngrx/signals/rxjs-interop";
import { tap } from "rxjs";
import { Status } from "./status/status-name.type";
import { withStatus } from "./status/status.feature";

interface RootState {
  loading: boolean;
}

const initialState: RootState = { loading: false };

export const RootStore = signalStore(
  { providedIn: "root" },
  withState<RootState>(initialState),
  withStatus(),
  withMethods(store => {
    return {
      setStatus: rxMethod<Status>(value$ => {
        return value$.pipe(tap(value => patchState(store, { status: value })));
      }),
    };
  })
);
