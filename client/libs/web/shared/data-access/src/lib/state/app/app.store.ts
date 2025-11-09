import { ParamKeys } from "@client/web-shared-constants";
import { patchState, signalStore, withMethods, withState } from "@ngrx/signals";
import { withAppReducer } from "./app.reducer";
type AppParams = Partial<Record<ParamKeys, string>>;

export type AppState = {
  params: AppParams;
  isSidebarCollapsed: boolean;
};

const initialState: AppState = {
  params: {},
  isSidebarCollapsed: false,
};

export const AppStore = signalStore(
  { providedIn: "root" },
  withState(initialState),
  withAppReducer(),
  withMethods(store => ({
    setParams(params: AppParams): void {
      patchState(store, { params });
    },
  }))
);
