import { Signal } from "@angular/core";
import { ActivatedRouteSnapshot } from "@angular/router";

export type ParamsConfig = Record<string, (param: string | undefined) => unknown>;

export type ParamsComputed<Config extends ParamsConfig> = {
  [Key in keyof Config]: Config[Key] extends infer TransformFn
    ? TransformFn extends (...args: unknown[]) => unknown
      ? Signal<ReturnType<TransformFn>>
      : never
    : never;
};

export function getDeepestChildSnapshot(
  snapshot: ActivatedRouteSnapshot
): ActivatedRouteSnapshot {
  let deepestChild = snapshot.firstChild;
  while (deepestChild?.firstChild != null) {
    deepestChild = deepestChild.firstChild;
  }
  return deepestChild || snapshot;
}
