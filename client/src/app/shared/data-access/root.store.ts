import { patchState, signalStore, withMethods, withState } from "@ngrx/signals";
import { prefix } from "@shared/utils";
import { finalize, Observable } from "rxjs";

type RootState = { loading: boolean };

const initialState: RootState = { loading: false };

export const RootStore = signalStore(
  { providedIn: "root" },
  withState<RootState>(initialState),
  withMethods(store => {
    return {
      showLoading: () => patchState(store, { loading: true }),
      hideLoading: () => patchState(store, { loading: false }),
      setLoading: (value: boolean) => patchState(store, { loading: value }),

      useLoading: <T>() => {
        return (source$: Observable<T>) =>
          source$.pipe(
            prefix(() => patchState(store, { loading: true })),
            finalize(() => patchState(store, { loading: false }))
          );
      },
    };
  })
);
