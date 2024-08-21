import { Injector, inject } from "@angular/core";

export class Application {
  static injector?: Injector;

  static create() {
    Application.injector = inject(Injector);
  }
}
