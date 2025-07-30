import { signalStoreFeature, type } from "@ngrx/signals";
import { on, withReducer } from "@ngrx/signals/events";
import { appEvents } from "./app.event";
import { AppState } from "./app.store";

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function withAppReducer() {
  return signalStoreFeature(
    { state: type<AppState>() },
    withReducer(
      on(appEvents.toggleSidebar, (_, state) => ({
        isSidebarCollapsed: !state.isSidebarCollapsed,
      })),
      on(appEvents.setSidebarCollapsed, ({ payload }) => ({
        isSidebarCollapsed: payload.collapsed,
      })),
      on(appEvents.reset, () => ({
        isSidebarCollapsed: false,
        theme: "light",
        language: "en",
      }))
    )
  );
}
