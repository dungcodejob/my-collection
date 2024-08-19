import { Injectable, Signal, inject } from "@angular/core";
import { debouncedSignal } from "@shared/utils";
import { Observable } from "rxjs";
import { RootStore } from "./root.store";
import { Status } from "./status/status-name.type";
type RxMethodInput<Input> = Input | Observable<Input> | Signal<Input>;
@Injectable({ providedIn: "root" })
export class RootFacade {
  private readonly _store = inject(RootStore);

  $loading = debouncedSignal(this._store.$isPending, 200);

  setStatus(value: RxMethodInput<Status>) {
    this._store.setStatus(value);
  }
}
