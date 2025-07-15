import { Directive, computed, inject, input } from "@angular/core";
import { BrnAvatarImageDirective } from "@spartan-ng/brain/avatar";
import { hlm } from "@spartan-ng/brain/core";
import type { ClassValue } from "clsx";

@Directive({
  selector: "img[hlmAvatarImage]",
  exportAs: "avatarImage",
  hostDirectives: [BrnAvatarImageDirective],
  host: {
    "[class]": "_computedClass()",
  },
})
export class HlmAvatarImageDirective {
  canShow = inject(BrnAvatarImageDirective).canShow;

  readonly userClass = input<ClassValue>("", { alias: "class" });
  protected readonly _computedClass = computed(() =>
    hlm("aspect-square size-full", this.userClass())
  );
}
