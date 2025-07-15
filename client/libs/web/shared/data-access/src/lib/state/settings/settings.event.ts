import { ThemeMode } from "@client/web-shared-services";
import { type } from "@ngrx/signals";
import { eventGroup } from "@ngrx/signals/events";
import { UserSettings } from "../../models/user-settings";

export const settingsEvents = eventGroup({
  source: "Settings",
  events: {
    themeChanged: type<{ theme: ThemeMode }>(),
    notificationsChanged: type<{ notificationsEnabled: boolean }>(),
    languageChanged: type<{ language: string }>(),
    timezoneChanged: type<{ timezone: string }>(),
    initSettingsForNewUser: type<void>(),
    load: type<void>(),
    save: type<{ settings: UserSettings }>(),
    initializer: type<void>(),
  },
});

export const settingsApiEvents = eventGroup({
  source: "Settings API",
  events: {
    saveSuccess: type<{ settings: UserSettings }>(),
    saveFailed: type<{ settings: UserSettings; error: string }>(),
    loadSuccess: type<{ settings: UserSettings }>(),
    loadFailed: type<{ settings: UserSettings; error: string }>(),
  },
});
