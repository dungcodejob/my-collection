import { computed } from "@angular/core";
import { ServerSideError } from "@core/http";
import {
  signalStoreFeature,
  withComputed,
  withState
} from "@ngrx/signals";

type Status = "idle" | "pending" | "fulfilled" | { error: ServerSideError };

export type StatusState = { status: Status };

export function withStatus() {
  return signalStoreFeature(
    withState<StatusState>({ status: "idle" }),
    withComputed(state => {
      const $status = state["status"];
      return {
        $isPending: computed(() => $status() === "pending"),
        $isFulfilled: computed(() => $status() === "fulfilled"),
        $error: computed(() => {
          const status = $status();
          return typeof status === "object" ? status.error : null;
        }),
      };
    })
  );
}

export function setPending(): StatusState {
  return { status: "pending" };
}

export function setFulfilled(): StatusState {
  return { status: "fulfilled" };
}

export function setError(error: ServerSideError): StatusState {
  return { status: { error } };
}
