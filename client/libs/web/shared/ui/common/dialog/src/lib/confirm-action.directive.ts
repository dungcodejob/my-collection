import {
  DestroyRef,
  Directive,
  HostListener,
  inject,
  input,
  output,
} from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { Observable, filter, of, switchMap, take } from "rxjs";
import {
  ConfirmDialogData,
  defaultConfirmDialogData,
} from "./confirm-dialog/confirm-dialog-data";
import { MCDialogService } from "./dialog.service";

/**
 * A reusable directive that shows a confirmation dialog before executing an action.
 * Can be applied to any clickable element to add confirmation functionality.
 *
 * @example
 * // Basic usage
 * <button
 *   type="button"
 *   mcConfirmAction
 *   (confirmed)="deleteItem()"
 *   confirmTitle="Delete Item"
 *   confirmDescription="Are you sure you want to delete this item? This action cannot be undone."
 *   confirmText="Delete"
 *   cancelText="Cancel">
 *   Delete
 * </button>
 *
 * @example
 * // With custom configuration
 * <button
 *   type="button"
 *   mcConfirmAction
 *   [confirmConfig]="{
 *     title: 'Archive Project',
 *     description: 'This will move the project to archive. You can restore it later.',
 *     confirmText: 'Archive',
 *     cancelText: 'Keep Active'
 *   }"
 *   (confirmed)="archiveProject()">
 *   Archive
 * </button>
 *
 * @example
 * // With loading state
 * <button
 *   type="button"
 *   mcConfirmAction
 *   [disabled]="isLoading()"
 *   (confirmed)="performAsyncAction()"
 *   confirmTitle="Process Data"
 *   confirmDescription="This will process all selected items. Continue?">
 *   @if (isLoading()) {
 *     Processing...
 *   } @else {
 *     Process Items
 *   }
 * </button>
 *
 * @example
 * // With API-based confirmation check
 * <button
 *   type="button"
 *   mcConfirmAction
 *   [shouldConfirm]="checkDeletePermission()"
 *   (confirmed)="deleteItem()"
 *   confirmTitle="Delete Item"
 *   confirmDescription="You have permission to delete this item. Continue?">
 *   Smart Delete
 * </button>
 *
 * // In component:
 * checkDeletePermission(): Observable<boolean> {
 *   return this.http.get<{canDelete: boolean}>('/api/user/permissions')
 *     .pipe(map(result => result.canDelete));
 * }
 */
@Directive({
  selector: "[mcConfirmAction]",
})
export class MCConfirmActionDirective {
  private readonly _dialogService = inject(MCDialogService);
  private readonly _destroyRef = inject(DestroyRef);

  /**
   * Complete configuration object for the confirmation dialog.
   * Takes precedence over individual input properties.
   */
  readonly confirmConfig = input<ConfirmDialogData>();

  /**
   * Title of the confirmation dialog.
   * Ignored if confirmConfig is provided.
   */
  readonly confirmTitle = input<string>();

  /**
   * Description/message of the confirmation dialog.
   * Ignored if confirmConfig is provided.
   */
  readonly confirmDescription = input<string>();

  /**
   * Text for the confirm button.
   * Ignored if confirmConfig is provided.
   */
  readonly confirmText = input<string>();

  /**
   * Text for the cancel button.
   * Ignored if confirmConfig is provided.
   */
  readonly cancelText = input<string>();

  /**
   * Whether to prevent the default click behavior.
   * Defaults to true to prevent form submission or navigation.
   */
  readonly preventDefault = input<boolean>(true);

  /**
   * Whether to stop event propagation.
   * Defaults to true to prevent parent click handlers.
   */
  readonly stopPropagation = input<boolean>(true);

  /**
   * Optional API call to check if confirmation is needed.
   * If provided, this Observable<boolean> will be called before showing the dialog.
   * - true: Show confirmation dialog
   * - false: Execute action directly without confirmation
   */
  readonly shouldConfirm = input<Observable<boolean>>();

  /**
   * Emitted when the user confirms the action.
   * This is where you should place your action logic.
   */
  readonly confirmed = output<void>();

  /**
   * Emitted when the user cancels the action.
   * Optional - use for cleanup or analytics.
   */
  readonly cancelled = output<void>();

  @HostListener("click", ["$event"])
  onClick(event: Event): void {
    if (this.preventDefault()) {
      event.preventDefault();
    }

    if (this.stopPropagation()) {
      event.stopPropagation();
    }

    this._handleAction();
  }

  private _handleAction(): void {
    const shouldConfirmObs = this.shouldConfirm();

    if (shouldConfirmObs) {
      shouldConfirmObs
        .pipe(
          take(1),
          switchMap((needsConfirmation: boolean) => {
            if (needsConfirmation) {
              return this.showConfirmDialog();
            } else {
              this.confirmed.emit();
              return of(null);
            }
          }),
          takeUntilDestroyed(this._destroyRef)
        )
        .subscribe();
    } else {
      this.showConfirmDialog().pipe(takeUntilDestroyed(this._destroyRef)).subscribe();
    }
  }

  private showConfirmDialog(): Observable<void> {
    const config = this.getDialogConfig();

    return this._dialogService.openConfirmDialog(config).pipe(
      take(1),
      filter((result): result is boolean => result !== undefined),
      switchMap((confirmed: boolean) => {
        if (confirmed) {
          this.confirmed.emit();
        } else {
          this.cancelled.emit();
        }
        return of(void 0);
      })
    );
  }

  private getDialogConfig(): ConfirmDialogData {
    const config = this.confirmConfig();
    if (config) {
      return { ...defaultConfirmDialogData, ...config };
    }
    return {
      ...defaultConfirmDialogData,
      title: this.confirmTitle() || defaultConfirmDialogData.title,
      description: this.confirmDescription() || defaultConfirmDialogData.description,
      confirmText: this.confirmText() || defaultConfirmDialogData.confirmText,
      cancelText: this.cancelText() || defaultConfirmDialogData.cancelText,
    };
  }
}
