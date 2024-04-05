import { patchState, signalStore, withMethods, withState } from "@ngrx/signals";

type ShellState = { loading: boolean };

const initialState: ShellState = { loading: false };

export const ShellStore = signalStore(
  withState<ShellState>(initialState),
  withMethods(store => {
    return {
      showLoading: () => patchState(store, { loading: true }),
      hideLoading: () => patchState(store, { loading: false }),
      setLoading: (value: boolean) => patchState(store, { loading: value }),
    };
  })
);
