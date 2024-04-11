export interface ConfirmDialogData {
  title?: string;
  description?: string;
  cancelText?: string;
  confirmText?: string;
}

export const defaultConfirmDialogData: ConfirmDialogData = {
  title: "Are you absolutely sure?",
  cancelText: "Cancel",
  confirmText: "Confirm",
};
