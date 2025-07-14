/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { isPlatformServer } from "@angular/common";
import { PLATFORM_ID, effect, inject } from "@angular/core";
import {
  EmptyFeatureResult,
  SignalStoreFeature,
  SignalStoreFeatureResult,
  getState,
  patchState,
  signalStoreFeature,
  withHooks,
  withMethods,
} from "@ngrx/signals";

const NOOP = () => void true;

type WithStorageSyncFeatureResult = EmptyFeatureResult & {
  methods: {
    clearStorage(): void;
    readFromStorage(): void;
    writeToStorage(): void;
    sync(): void;
  };
};

const StorageSyncStub: Pick<WithStorageSyncFeatureResult, "methods">["methods"] = {
  clearStorage: NOOP,
  readFromStorage: NOOP,
  writeToStorage: NOOP,
  sync: NOOP,
};

export type SyncConfig<State> = {
  /**
   * The key which is used to access the storage.
   */
  key: string;
  /**
   * Flag indicating if the store should read from storage on init and write to storage on every state change.
   *
   * `true` by default
   */
  autoSync?: boolean;
  /**
   * Function to select that portion of the state which should be stored.
   *
   * Returns the whole state object by default
   */
  select?: (state: State) => Partial<State>;
  /**
   * Function used to parse the state coming from storage.
   *
   * `JSON.parse()` by default
   */
  parse?: (stateString: string) => State;
  /**
   * Function used to tranform the state into a string representation.
   *
   * `JSON.stringify()` by default
   */
  stringify?: (state: State) => string;
  /**
   * Factory function used to select the storage.
   *
   * `localstorage` by default
   */
  storage?: () => Storage;
};

/**
 * Enables store synchronization with storage.
 *
 * Only works on browser platform.
 */
export function withStorageSync<Input extends SignalStoreFeatureResult>(
  key: string
): SignalStoreFeature<Input, WithStorageSyncFeatureResult>;
export function withStorageSync<Input extends SignalStoreFeatureResult>(
  config: SyncConfig<Input["state"]>
): SignalStoreFeature<Input, WithStorageSyncFeatureResult>;
export function withStorageSync<
  State extends object,
  Input extends SignalStoreFeatureResult
>(
  configOrKey: SyncConfig<Input["state"]> | string
): SignalStoreFeature<Input, WithStorageSyncFeatureResult> {
  const {
    key,
    autoSync = true,
    select = (state: State) => state,
    parse = JSON.parse,
    stringify = JSON.stringify,
    storage: storageFactory = (): Storage => localStorage,
  } = typeof configOrKey === "string" ? { key: configOrKey } : configOrKey;

  return signalStoreFeature(
    withMethods((store, platformId = inject(PLATFORM_ID)) => {
      if (isPlatformServer(platformId)) {
        console.warn(
          `'withStorageSync' provides non-functional implementation due to server-side execution`
        );
        return StorageSyncStub;
      }

      const storage = storageFactory();

      const clearStorage = () => {
        storage.removeItem(key);
      };

      const readFromStorage = () => {
        const stateString = storage.getItem(key);
        if (stateString) {
          patchState(store, parse(stateString));
        }
      };

      const writeToStorage = () => {
        const slicedState = select(getState(store) as State);
        storage.setItem(key, stringify(slicedState));
      };

      const sync = () => {
        if (isPlatformServer(platformId)) {
          return;
        }

        if (autoSync) {
          readFromStorage();

          effect(() => {
            writeToStorage();
          });
        }
      };

      return {
        /**
         * Removes the item stored in storage.
         */
        clearStorage,
        /**
         * Reads item from storage and patches the state.
         */
        readFromStorage,
        /**
         * Writes selected portion to storage.
         */
        writeToStorage,
        sync,
      };
    }),
    withHooks({
      onInit(store) {
        store.sync();
      },
    })
  );
}
