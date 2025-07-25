import {
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChild,
  inject,
  input,
} from "@angular/core";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucideChevronDown } from "@ng-icons/lucide";
import { hlm } from "@spartan-ng/brain/core";
import { BrnSelectComponent, BrnSelectTriggerDirective } from "@spartan-ng/brain/select";
import { HlmIconDirective } from "@spartan-ng/helm/icon";
import { cva } from "class-variance-authority";
import type { ClassValue } from "clsx";

export const selectTriggerVariants = cva(
  `border-input [&>ng-icon]:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 dark:bg-input/30 dark:hover:bg-input/50 flex w-fit items-center justify-between gap-2 rounded-md border bg-transparent px-3 py-2 text-sm whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 data-[size=default]:h-9 data-[size=sm]:h-8 [&>ng-icon]:pointer-events-none [&>ng-icon]:shrink-0 [&>ng-icon]:size-4`,
  {
    variants: {
      error: {
        auto: "[&.ng-invalid.ng-touched]:text-destructive [&.ng-invalid.ng-touched]:border-destructive [&.ng-invalid.ng-touched]:focus-visible:ring-destructive/20 dark:[&.ng-invalid.ng-touched]:focus-visible:ring-destructive/40",
        true: "text-destructive border-destructive focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40",
      },
    },
    defaultVariants: {
      error: "auto",
    },
  }
);

@Component({
  selector: "hlm-select-trigger",
  imports: [BrnSelectTriggerDirective, NgIcon, HlmIconDirective],
  providers: [provideIcons({ lucideChevronDown })],
  template: `
    <button
      #button
      brnSelectTrigger
      hlmInput
      type="button"
      [attr.data-size]="size()"
      [class]="_computedClass()"
    >
      <ng-content />
      @if (icon()) {
        <ng-content select="ng-icon" />
      } @else {
        <ng-icon class="ml-2 flex-none" hlm name="lucideChevronDown" size="sm" />
      }
    </button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HlmSelectTriggerComponent {
  protected readonly icon = contentChild(HlmIconDirective);

  protected readonly brnSelect = inject(BrnSelectComponent, { optional: true });

  readonly userClass = input<ClassValue>("", { alias: "class" });

  readonly size = input<"default" | "sm">("default");

  protected readonly _computedClass = computed(() =>
    hlm(selectTriggerVariants({ error: this.brnSelect?.errorState() }), this.userClass())
  );
}
