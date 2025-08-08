import type { ComponentType } from "@angular/cdk/portal";
import { Injectable, type TemplateRef, ViewContainerRef, inject } from "@angular/core";
import {
  type BrnDialogOptions,
  BrnDialogRef,
  BrnDialogService,
  DEFAULT_BRN_DIALOG_OPTIONS,
  cssClassesToArray,
} from "@spartan-ng/brain/dialog";
import { HlmDialogContentComponent } from "./hlm-dialog-content.component";
import { hlmDialogOverlayClass } from "./hlm-dialog-overlay.directive";

export type HlmDialogOptions<DialogContext extends Record<string, unknown> = {}> =
  BrnDialogOptions & {
    contentClass?: string;
    context?: DialogContext;
    viewContainerRef?: ViewContainerRef;
  };

@Injectable({
  providedIn: "root",
})
export class HlmDialogService {
  private readonly _brnDialogService = inject(BrnDialogService);

  open(
    component: ComponentType<unknown> | TemplateRef<unknown>,
    options?: Partial<HlmDialogOptions>
  ): BrnDialogRef<any> {
    const mergedOptions = {
      ...DEFAULT_BRN_DIALOG_OPTIONS,

      ...(options ?? {}),
      backdropClass: cssClassesToArray(
        `${hlmDialogOverlayClass} ${options?.backdropClass ?? ""}`
      ),
      context: {
        ...(options?.context ?? {}),
        $component: component,
        $dynamicComponentClass: options?.contentClass,
      },
    };

    return this._brnDialogService.open(
      HlmDialogContentComponent,
      options?.viewContainerRef,
      mergedOptions.context,
      mergedOptions
    );
  }
}
