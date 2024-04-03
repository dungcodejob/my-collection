import { Component, inject } from "@angular/core";
import {
  HlmAlertDialogActionButtonDirective,
  HlmAlertDialogCancelButtonDirective,
  HlmAlertDialogComponent,
  HlmAlertDialogContentComponent,
  HlmAlertDialogDescriptionDirective,
  HlmAlertDialogFooterComponent,
  HlmAlertDialogHeaderComponent,
  HlmAlertDialogOverlayDirective,
  HlmAlertDialogTitleDirective,
} from "@spartan-ng/ui-alertdialog-helm";
import { BrnDialogRef } from "@spartan-ng/ui-dialog-brain";

@Component({
  selector: "app-confirm-dialog",
  standalone: true,
  imports: [
    HlmAlertDialogComponent,
    HlmAlertDialogOverlayDirective,
    HlmAlertDialogHeaderComponent,
    HlmAlertDialogFooterComponent,
    HlmAlertDialogTitleDirective,
    HlmAlertDialogDescriptionDirective,
    HlmAlertDialogCancelButtonDirective,
    HlmAlertDialogActionButtonDirective,
    HlmAlertDialogContentComponent,
  ],
  templateUrl: "./confirm-dialog.component.html",
  styleUrl: "./confirm-dialog.component.scss",
})
export class ConfirmDialogComponent {
  private readonly _dialogRef = inject<BrnDialogRef<boolean>>(BrnDialogRef);

  onClose(): void {
    this._dialogRef.close(false);
  }

  onSave(): void {
     this._dialogRef.close(true);
  }
}
