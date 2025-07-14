import { ChangeDetectionStrategy, Component, computed, input } from "@angular/core";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucideChevronDown } from "@ng-icons/lucide";
import { hlm } from "@spartan-ng/brain/core";
import { HlmIconDirective } from "@spartan-ng/helm/icon";
import { ClassValue } from "clsx";

@Component({
  selector: "hlm-select-scroll-down",
  imports: [NgIcon, HlmIconDirective],
  providers: [provideIcons({ lucideChevronDown })],
  host: {
    "[class]": "_computedClass()",
  },
  template: ` <ng-icon class="ml-2" hlm name="lucideChevronDown" size="sm" /> `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HlmSelectScrollDownComponent {
  readonly userClass = input<ClassValue>("", { alias: "class" });
  protected readonly _computedClass = computed(() =>
    hlm("flex cursor-default items-center justify-center py-1", this.userClass())
  );
}
