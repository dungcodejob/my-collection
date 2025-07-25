import { BooleanInput } from "@angular/cdk/coercion";
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from "@angular/core";
import { RouterLink } from "@angular/router";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucideChevronLeft } from "@ng-icons/lucide";
import { hlm } from "@spartan-ng/brain/core";
import { ButtonVariants } from "@spartan-ng/helm/button";
import { HlmIconDirective } from "@spartan-ng/helm/icon";
import { ClassValue } from "clsx";
import { HlmPaginationLinkDirective } from "./hlm-pagination-link.directive";

@Component({
  selector: "hlm-pagination-previous",
  imports: [HlmPaginationLinkDirective, NgIcon, HlmIconDirective],
  providers: [provideIcons({ lucideChevronLeft })],
  template: `
    <a
      hlmPaginationLink
      [attr.aria-label]="ariaLabel()"
      [class]="_computedClass()"
      [link]="link()"
      [queryParams]="queryParams()"
      [queryParamsHandling]="queryParamsHandling()"
      [size]="size()"
    >
      <ng-icon hlm name="lucideChevronLeft" size="sm" />
      <span [class]="_labelClass()">{{ text() }}</span>
    </a>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HlmPaginationPreviousComponent {
  readonly userClass = input<ClassValue>("", { alias: "class" });
  /** The link to navigate to the previous page. */
  readonly link = input<RouterLink["routerLink"]>();
  /** The query parameters to pass to the previous page. */
  readonly queryParams = input<RouterLink["queryParams"]>();
  /** How to handle query parameters when navigating to the previous page. */
  readonly queryParamsHandling = input<RouterLink["queryParamsHandling"]>();

  /** The aria-label for the previous page link. */
  readonly ariaLabel = input<string>("Go to previous page", {
    alias: "aria-label",
  });
  /** The text to display for the previous page link. */
  readonly text = input<string>("Previous");
  /** Whether the button should only display the icon. */
  readonly iconOnly = input<boolean, BooleanInput>(false, {
    transform: booleanAttribute,
  });
  protected readonly _labelClass = computed(() =>
    this.iconOnly() ? "sr-only" : "hidden sm:block"
  );

  protected readonly size = computed<ButtonVariants["size"]>(() =>
    this.iconOnly() ? "icon" : "default"
  );

  protected readonly _computedClass = computed(() =>
    hlm("gap-1", !this.iconOnly() ? "sm:pl-2.5" : "", this.userClass())
  );
}
