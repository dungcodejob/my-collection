import { effect, inject, Injector } from "@angular/core";
import { StorageService } from "@client/web-shared-services";
import { StatusState } from "@client/web-shared-utils";
import { patchState, signalStoreFeature, type } from "@ngrx/signals";
import { Events, withEffects } from "@ngrx/signals/events";
import { catchError, exhaustMap, map, Observable, of, tap } from "rxjs";
import { UserSettings } from "../../models/user-settings";
import { UserApi } from "../user/user.api";
import { settingsApiEvents, settingsEvents } from "./settings.event";
import { SettingsService } from "./settings.service";
import { SettingsState } from "./settings.store";

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function withSettingsEffects() {
  return signalStoreFeature(
    { state: type<SettingsState & StatusState>() },
    withEffects(
      (
        store,
        events = inject(Events),
        storage = inject(StorageService),
        injector = inject(Injector),
        service = inject(SettingsService),
        api = inject(UserApi)
      ) => {
        const storageSettings = storage.use<UserSettings>("settings");

        const loadFormAPI = (): Observable<UserSettings | null> => {
          return api.getSettings();
        };

        const saveSettingToLocal = (settings: UserSettings | null): void => {
          storage.set("settings", settings);
        };

        return {
          load: events.on(settingsEvents.load).pipe(
            exhaustMap(() => {
              const localSettings = storageSettings.get();
              if (localSettings) {
                return of(settingsApiEvents.loadSuccess({ settings: localSettings }));
              }

              return loadFormAPI().pipe(
                tap(settings => saveSettingToLocal(settings)),
                map(settings =>
                  settings
                    ? settingsApiEvents.loadSuccess({ settings })
                    : settingsEvents.initSettingsForNewUser()
                ),
                catchError(error =>
                  of(
                    settingsApiEvents.loadFailed({
                      settings: service.getDefaultSettings(),
                      error,
                    })
                  )
                )
              );
            })
          ),

          update: events.on(settingsEvents.save).pipe(
            exhaustMap(event =>
              api.updateSettings(event.payload.settings).pipe(
                map(settings => settingsApiEvents.saveSuccess({ settings })),
                catchError(error =>
                  of(
                    settingsApiEvents.loadFailed({
                      settings: event.payload.settings,
                      error,
                    })
                  )
                )
              )
            )
          ),

          initSettingsForNewUser: events.on(settingsEvents.initSettingsForNewUser).pipe(
            map(() => {
              const initialSettings = service.getInitialSettingsForNewUser();

              return [
                settingsApiEvents.loadSuccess({
                  settings: initialSettings,
                }),
                settingsEvents.save({
                  settings: initialSettings,
                }),
              ];
            })
          ),

          initializer: events.on(settingsEvents.initializer).pipe(
            tap(() => {
              const localSettings = storageSettings.get();
              if (localSettings) {
                patchState(store, { settings: localSettings });
              }

              effect(
                () => {
                  const settings = store.settings();
                  storageSettings.set(settings);
                },
                { injector }
              );
            }),
            map(() => settingsEvents.load())
          ),
        };
      }
    )
  );
}
