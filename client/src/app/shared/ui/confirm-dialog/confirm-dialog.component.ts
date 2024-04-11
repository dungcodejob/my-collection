import { Component, OnInit, inject } from "@angular/core";
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
import { BrnDialogRef, injectBrnDialogContext } from "@spartan-ng/ui-dialog-brain";
import { ConfirmDialogData, defaultConfirmDialogData } from "./confirm-dialog-data";

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
