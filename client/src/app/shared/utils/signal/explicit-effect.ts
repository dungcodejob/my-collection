import { CreateEffectOptions, Signal, effect, untracked } from "@angular/core";

export function explicitEffect<T>(
  source: Signal<T>,
  action: (value: T) => void,
  options?: CreateEffectOptions
) {
  effect(() => {
    const s = source();
    untracked(() => {
      action(s);
    });
  }, options);
}
