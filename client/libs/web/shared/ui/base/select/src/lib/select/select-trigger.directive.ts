import { Directive, inject, TemplateRef } from "@angular/core";
import { SelectOption } from "./select";

export type MCSelectTriggerContext = {
  $implicit: SelectOption | null;
  displayText: string;
};

@Directive({
  selector: "ng-template[mcSelectTrigger]",
  standalone: true,
})
export class MCSelectTrigger {
  readonly templateRef = inject(TemplateRef<MCSelectTriggerContext>);

  static ngTemplateContextGuard(
    dir: MCSelectTrigger,
    ctx: unknown
  ): ctx is MCSelectTriggerContext {
    return true;
  }
}
