import { Component, input } from "@angular/core";
import { NgIconComponent, provideIcons } from "@ng-icons/core";
import { lucideCirclePlus } from "@ng-icons/lucide";
import { HlmButtonImports } from "@spartan-ng/helm/button";
import { SelectOption } from "../select/select";
@Component({
  selector: "mc-filter-trigger",
  imports: [HlmButtonImports, NgIconComponent],
  providers: [provideIcons({ lucideCirclePlus })],
  templateUrl: "./filter-trigger.html",
})
export class MCFilterTrigger {
  readonly title = input.required<string>();
  readonly items = input<SelectOption[]>([]);
}
