import { Injectable } from "@angular/core";

import { BrnDialogRef } from "@spartan-ng/brain/dialog";
import { HlmDialogService } from "@spartan-ng/helm/dialog";
import { ConfirmDialogData } from "./confirm-dialog/confirm-dialog-data";
import { MCConfirmDialogComponent } from "./confirm-dialog/confirm-dialog.component";

@Injectable({ providedIn: "root" })
export class MCDialogService extends HlmDialogService {
  openConfirmDialog = (data: ConfirmDialogData): BrnDialogRef => {
    const ref = this.open(MCConfirmDialogComponent, {
      closeOnBackdropClick: false,
      context: { data },
    });
    return ref;
  };
}
