import { Injectable } from "@angular/core";
import { HlmDialogService } from "@spartan-ng/ui-dialog-helm";
import { Observable } from "rxjs";
import { ConfirmDialogData } from "./confirm-dialog-data";
import { ConfirmDialogComponent } from "./confirm-dialog.component";

@Injectable({ providedIn: "root" })
export class PadDialogService extends HlmDialogService {
  openConfirmDialog = (data: ConfirmDialogData): Observable<boolean> => {
    return this.open(ConfirmDialogComponent, {
      closeOnBackdropClick: false,
      context: { data },
    }).closed$;
  };
}
