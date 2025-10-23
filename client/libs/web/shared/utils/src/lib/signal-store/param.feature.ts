/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { Signal, effect, inject } from "@angular/core";
import { ActivatedRoute, Router, type Params } from "@angular/router";
import {
  EmptyFeatureResult,
  SignalStoreFeature,
  patchState,
  signalStoreFeature,
  withComputed,
  withMethods,
  withState,
} from "@ngrx/signals";
import { injectParams } from "../injector/inject-params";
import { isNil } from "../type";

/**
 * A minimal, type-safe SignalStore feature that adds a single `param` to state
 * and exposes a `setParam` method to update it.
 *
 * Syncs state from route params using `injectParams` and writes back by replacing
 * the last path segment in the current URL. No `key` required.
 */
export type ParamFeatureConfig<TValue, KValue extends Params = Params> = {
  initial?: TValue | null;
  /**
   * Read value from route params. If omitted, uses the first param value.
   */
  read?: (params: Params) => TValue | null;
  /**
   * Serialize value when writing to URL. Return `undefined`/`null` to skip navigation.
   * Now returns `KValue` for flexible output typing.
   */
  serialize?: (value: TValue | null) => KValue | null | undefined;
  /**
   * Replace URL instead of pushing a new history entry. Default `true`.
   */
  replaceUrl?: boolean;
};

function defaultRead<T>(params: Params): T | null {
  return params as T;
}

function defaultSerialize<TValue>(value: TValue | null): TValue | undefined {
  if (value === null || value === undefined) return undefined;
  // Default behavior: pass-through the value, letting callers provide a custom serializer
  // when they need specific shapes (e.g., Params object). Avoid JSON.stringify.
  return value as TValue;
}

export function withParam<TValue = unknown, KValue extends Params = Params>(
  config?: ParamFeatureConfig<TValue, KValue>
): SignalStoreFeature<
  EmptyFeatureResult,
  EmptyFeatureResult & {
    state: { param: TValue | null };
    props: { $param: Signal<TValue | null> };
    methods: { setParam: (value: TValue | null) => void };
  }
>;
export function withParam<TValue = unknown, KValue extends Params = Params>(
  configOrInitial?: ParamFeatureConfig<TValue, KValue> | TValue | null
): SignalStoreFeature<
  EmptyFeatureResult,
  EmptyFeatureResult & {
    state: { param: TValue | null };
    props: { $param: Signal<TValue | null> };
    methods: { setParam: (value: TValue | null) => void };
  }
> {
  const resolvedConfig: ParamFeatureConfig<TValue, KValue> =
    typeof configOrInitial === "object" && configOrInitial !== null
      ? (configOrInitial as ParamFeatureConfig<TValue, KValue>)
      : { initial: (configOrInitial as TValue | null) ?? null };

  const {
    initial = null,
    read = defaultRead<TValue>,
    serialize = defaultSerialize<TValue>,
    replaceUrl = true,
  } = resolvedConfig;

  return signalStoreFeature(
    withState(() => ({
      param: (initial ?? null) as TValue | null,
    })),
    withComputed((store: { param: Signal<TValue | null> }) => ({
      $param: store.param,
    })),
    withMethods(
      (
        store,
        router = inject(Router),
        route = inject(ActivatedRoute),
        $params = injectParams(read)
      ) => {
        // Keep state in sync with route params
        effect(() => {
          const v = $params();
          patchState(store, { param: (v as TValue | null) ?? null });
        });

        return {
          setParam(value: TValue | null) {
            patchState(store, { param: value });

            const serialized = serialize(value);
            // Skip navigation if value should not be written
            if (isNil(serialized)) {
              return;
            }

            router.navigate([], {
              relativeTo: route,
              replaceUrl,
              queryParams: serialized as KValue,
              queryParamsHandling: "merge",
            });
          },
        };
      }
    )
  );
}
