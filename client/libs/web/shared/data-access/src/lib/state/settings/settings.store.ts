import { withStatus } from "@client/web-shared-utils";
import { signalStore, withState } from "@ngrx/signals";
import { UserSettings } from "../../models/user-settings";
import { withSettingsEffects } from "./settings.effects";
import { withSettingsReducer } from "./settings.reducer";

export type SettingsState = {
  settings: UserSettings | null;
};

const initialState: SettingsState = {
  settings: null,
};

export const SettingsStore = signalStore(
  withState(initialState),
  withStatus(),
  withSettingsReducer(),
  withSettingsEffects()
);
