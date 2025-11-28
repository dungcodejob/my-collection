import { ParamKeys } from "@client/web-shared-constants";
import { patchState, signalStore, withMethods, withState } from "@ngrx/signals";
type AppParams = Partial<Record<ParamKeys, string>>;

export type AppState = {
  params: AppParams;
  theme: string;
  language: string;
  isSidebarCollapsed: boolean;
};

const initialState: AppState = {
  params: {},
  theme: "light",
  language: "en",
  isSidebarCollapsed: false,
};

export const AppStore = signalStore(
  { providedIn: "root" },
  withState(initialState),
  withMethods(store => ({
    toggleSidebar(): void {
      const isSidebarCollapsed = store.isSidebarCollapsed();
      patchState(store, { isSidebarCollapsed: isSidebarCollapsed });
    },
    setTheme(theme: string): void {
      patchState(store, { theme });
    },
    setLanguage(language: string): void {
      patchState(store, { language });
    },
    setParams(params: AppParams): void {
      patchState(store, { params });
    },
  }))
);
