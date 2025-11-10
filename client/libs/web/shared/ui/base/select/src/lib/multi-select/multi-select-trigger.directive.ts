import { Directive, inject, TemplateRef } from "@angular/core";
import { SelectOption } from "../select/select";

export type MCMultiSelectTriggerContext = {
  $implicit: SelectOption[];
  displayText: string;
  selectedValues: string[];
};

@Directive({
  selector: "ng-template[mcMultiSelectTrigger]",
  standalone: true,
})
export class MCMultiSelectTrigger {
  readonly templateRef = inject(TemplateRef<MCMultiSelectTriggerContext>);

  static ngTemplateContextGuard(
    dir: MCMultiSelectTrigger,
    ctx: unknown
  ): ctx is MCMultiSelectTriggerContext {
    return true;
  }
}
