import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  computed,
  input,
  numberAttribute,
} from "@angular/core";
import { hlm } from "@spartan-ng/brain/core";
import type { ClassValue } from "clsx";
import { NgxSonnerToaster, type ToasterProps } from "ngx-sonner";

@Component({
  selector: "hlm-toaster",
  imports: [NgxSonnerToaster],
  template: `
    <ngx-sonner-toaster
      [class]="_computedClass()"
      [closeButton]="closeButton()"
      [dir]="dir()"
      [duration]="duration()"
      [expand]="expand()"
      [hotKey]="hotKey()"
      [invert]="invert()"
      [offset]="offset()"
      [position]="position()"
      [richColors]="richColors()"
      [style]="userStyle()"
      [theme]="theme()"
      [toastOptions]="toastOptions()"
      [visibleToasts]="visibleToasts()"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HlmToasterComponent {
  readonly invert = input<ToasterProps["invert"], boolean | string>(false, {
    transform: booleanAttribute,
  });
  readonly theme = input<ToasterProps["theme"]>("light");
  readonly position = input<ToasterProps["position"]>("bottom-right");
  readonly hotKey = input<ToasterProps["hotkey"]>(["altKey", "KeyT"]);
  readonly richColors = input<ToasterProps["richColors"], boolean | string>(false, {
    transform: booleanAttribute,
  });
  readonly expand = input<ToasterProps["expand"], boolean | string>(false, {
    transform: booleanAttribute,
  });
  readonly duration = input<ToasterProps["duration"], number | string>(4000, {
    transform: numberAttribute,
  });
  readonly visibleToasts = input<ToasterProps["visibleToasts"], number | string>(3, {
    transform: numberAttribute,
  });
  readonly closeButton = input<ToasterProps["closeButton"], boolean | string>(false, {
    transform: booleanAttribute,
  });
  readonly toastOptions = input<ToasterProps["toastOptions"]>({
    classes: {
      toast:
        "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
      description: "group-[.toast]:text-muted-foreground",
      actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
      cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
    },
  });
  readonly offset = input<ToasterProps["offset"]>(null);
  readonly dir = input<ToasterProps["dir"]>("auto");
  readonly userClass = input<ClassValue>("", { alias: "class" });
  readonly userStyle = input<Record<string, string>>({}, { alias: "style" });

  protected readonly _computedClass = computed(() =>
    hlm("toaster group", this.userClass())
  );
}
