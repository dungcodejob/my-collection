import { patchState, signalStore, withMethods, withState } from "@ngrx/signals";

type RootState = { loading: boolean };

const initialState: RootState = { loading: false };

export const RootStore = signalStore(
  withState<RootState>(initialState),
  withMethods(store => {
    return {
      showLoading: () => patchState(store, { loading: true }),
      hideLoading: () => patchState(store, { loading: false }),
      setLoading: (value: boolean) => patchState(store, { loading: value }),
    };
  })
);
