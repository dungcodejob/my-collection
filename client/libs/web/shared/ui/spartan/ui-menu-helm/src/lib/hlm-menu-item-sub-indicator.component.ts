import { ChangeDetectionStrategy, Component, computed, input } from "@angular/core";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucideChevronRight } from "@ng-icons/lucide";
import { hlm } from "@spartan-ng/brain/core";
import { HlmIconDirective } from "@spartan-ng/helm/icon";
import { ClassValue } from "clsx";

@Component({
  selector: "hlm-menu-item-sub-indicator",
  providers: [provideIcons({ lucideChevronRight })],
  imports: [NgIcon, HlmIconDirective],
  template: `
    <ng-icon class="text-popover-foreground" hlm name="lucideChevronRight" size="sm" />
  `,
  host: {
    "[class]": "_computedClass()",
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HlmMenuItemSubIndicatorComponent {
  readonly userClass = input<ClassValue>("", { alias: "class" });
  protected readonly _computedClass = computed(() =>
    hlm("ml-auto size-4", this.userClass())
  );
}
