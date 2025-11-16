import { Component, input } from "@angular/core";

@Component({
  selector: "base-select",
  template: "",
})
export abstract class BaseSelect {
  readonly selectContentClass = input<string>("");
}
