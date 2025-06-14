import { patchState, signalStore, withMethods, withState } from "@ngrx/signals";

type AppState = {
  loading: boolean;
};

const initialState: AppState = {
  loading: false,
};

export const AppStore = signalStore(
  { providedIn: "root" },
  withState(initialState),

  withMethods(store => {
    return {
      setLoading(loading: boolean) {
        patchState(store, { loading });
      },
    };
  })
);
