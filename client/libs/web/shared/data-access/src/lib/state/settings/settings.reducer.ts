import {
  setError,
  setFulfilled,
  setPending,
  StatusState,
} from "@client/web-shared-utils";
import { signalStoreFeature, type } from "@ngrx/signals";
import { on, withReducer } from "@ngrx/signals/events";
import { UserSettings } from "../../models/user-settings";
import { settingsApiEvents, settingsEvents } from "./settings.event";
import { SettingsState } from "./settings.store";

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function withSettingsReducer() {
  return signalStoreFeature(
    { state: type<SettingsState & StatusState>() },
    withReducer(
      on(settingsEvents.themeChanged, ({ payload }, state) => {
        const settings = { ...state.settings, theme: payload.theme } as UserSettings;

        return { settings };
      }),
      on(settingsEvents.languageChanged, ({ payload }, state) => {
        const settings = {
          ...state.settings,
          language: payload.language,
        } as UserSettings;

        return { settings };
      }),
      on(settingsEvents.timezoneChanged, ({ payload }, state) => {
        const settings = {
          ...state.settings,
          timezone: payload.timezone,
        } as UserSettings;

        return { settings };
      }),
      on(settingsEvents.save, settingsEvents.load, setPending),
      on(settingsApiEvents.loadFailed, settingsApiEvents.saveFailed, ({ payload }) => ({
        settings: payload.settings,
        ...setError(payload.error),
      })),
      on(settingsApiEvents.saveSuccess, settingsApiEvents.loadSuccess, ({ payload }) => ({
        settings: payload.settings,
        ...setFulfilled(),
      }))
    )
  );
}
