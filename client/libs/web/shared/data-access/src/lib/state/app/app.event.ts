import { type } from "@ngrx/signals";
import { eventGroup } from "@ngrx/signals/events";

export const appEvents = eventGroup({
  source: "App",
  events: {
    toggleSidebar: type<void>(),
    setSidebarCollapsed: type<{ collapsed: boolean }>(),
    setTheme: type<{ theme: string }>(),
    setLanguage: type<{ language: string }>(),
    reset: type<void>(),
  },
});
