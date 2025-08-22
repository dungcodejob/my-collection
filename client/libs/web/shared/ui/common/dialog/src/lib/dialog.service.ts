import { Injectable } from "@angular/core";

import { HlmDialogService } from "@spartan-ng/helm/dialog";
import { Observable } from "rxjs";
import { ConfirmDialogData } from "./confirm-dialog/confirm-dialog-data";
import { ConfirmDialogComponent } from "./confirm-dialog/confirm-dialog.component";

@Injectable({ providedIn: "root" })
export class MCDialogService extends HlmDialogService {
  openConfirmDialog = (data: ConfirmDialogData): Observable<boolean> => {
    return this.open(ConfirmDialogComponent, {
      closeOnBackdropClick: false,
      context: { data },
    }).closed$;
  };
}
