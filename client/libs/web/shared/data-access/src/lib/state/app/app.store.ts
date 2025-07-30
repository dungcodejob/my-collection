import { signalStore, withState } from "@ngrx/signals";
import { withAppReducer } from "./app.reducer";

export type AppState = {
  isSidebarCollapsed: boolean;
};

const initialState: AppState = {
  isSidebarCollapsed: false,
};

export const AppStore = signalStore(withState(initialState), withAppReducer());
