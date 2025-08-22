import { Component, OnInit, inject } from "@angular/core";
import { HlmAlertDialogModule } from "@spartan-ng/helm/alert-dialog";

import { BrnDialogRef, injectBrnDialogContext } from "@spartan-ng/brain/dialog";
import { ConfirmDialogData, defaultConfirmDialogData } from "./confirm-dialog-data";

@Component({
  standalone: true,
  imports: [HlmAlertDialogModule],
  templateUrl: "./confirm-dialog.component.html",
  styleUrl: "./confirm-dialog.component.scss",
})
export class ConfirmDialogComponent implements OnInit {
  private readonly _dialogRef = inject<BrnDialogRef<boolean>>(BrnDialogRef);
  private readonly _dialogContext = injectBrnDialogContext<{
    data: ConfirmDialogData | null;
  }>();

  data = defaultConfirmDialogData;

  ngOnInit(): void {
    if (this._dialogContext.data) {
      this.data = {
        ...defaultConfirmDialogData,
        ...this._dialogContext.data,
      };
    }
  }

  onClose(): void {
    this._dialogRef.close(false);
  }

  onSave(): void {
    this._dialogRef.close(true);
  }
}
