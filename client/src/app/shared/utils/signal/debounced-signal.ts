import { Signal, effect, signal } from "@angular/core";

export function debouncedSignal<T>(
  sourceSignal: Signal<T>,
  debounceTimeInMs = 0
): Signal<T> {
  const debounceSignal = signal(sourceSignal());
  effect(
    onCleanup => {
      const value = sourceSignal();
      const timeout = setTimeout(() => debounceSignal.set(value), debounceTimeInMs);

      // The `onCleanup` argument is a function which is called when the effect
      // runs again (and when it is destroyed).
      // By clearing the timeout here we achieve proper debouncing.
      // See https://angular.io/guide/signals#effect-cleanup-functions
      onCleanup(() => clearTimeout(timeout));
    },
    { allowSignalWrites: true }
  );
  return debounceSignal;
}
