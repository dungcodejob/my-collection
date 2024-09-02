import { Directive, input } from "@angular/core";

@Directive({
  selector: "app-filter-option",
  standalone: true,
})
export class FilterOptionDirective<T = unknown> {
  $label = input.required<string>({ alias: "label" });
  $value = input.required<T>({ alias: "value" });
}
