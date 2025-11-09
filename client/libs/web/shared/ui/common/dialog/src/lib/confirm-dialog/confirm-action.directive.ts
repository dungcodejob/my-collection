import {
  DestroyRef,
  Directive,
  HostListener,
  inject,
  input,
  isSignal,
  output,
  Signal,
} from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { isObservable, Observable, of, switchMap, take, tap } from "rxjs";
import { MCDialogService } from "../dialog.service";
import { ConfirmDialogData, defaultConfirmDialogData } from "./confirm-dialog-data";

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

type ConditionFn = () => Observable<boolean> | boolean | Signal<boolean> | undefined;

@Directive({
  selector: "[mcConfirm]",
})
export class MCConfirmActionDirective {
  private readonly _dialogService = inject(MCDialogService);
  private readonly _destroyRef = inject(DestroyRef);

  readonly confirmConfig = input<ConfirmDialogData>();
  readonly confirmTitle = input<string>();
  readonly confirmDescription = input<string>();
  readonly confirmText = input<string>();
  readonly cancelText = input<string>();

  readonly isTriggerPreventDefault = input<boolean>(true);
  readonly isTriggerStopPropagation = input<boolean>(true);
  readonly conditionFn = input<ConditionFn>();

  readonly confirmed = output<void>();
  readonly cancelled = output<void>();

  @HostListener("click", ["$event"])
  onClick(event: Event): void {
    if (this.isTriggerPreventDefault()) {
      event.preventDefault();
    }

    if (this.isTriggerStopPropagation()) {
      event.stopPropagation();
    }

    this._handleAction();
  }

  private _handleAction(): void {
    const fn = this.conditionFn();
    const shouldConfirmObs = fn ? fn() : false;

    if (isObservable(shouldConfirmObs)) {
      shouldConfirmObs
        .pipe(
          take(1),
          switchMap((needsConfirmation: boolean) => {
            if (needsConfirmation) {
              return this.showConfirmDialog();
            } else {
              // Execute immediately if no confirmation needed
              this.confirmed.emit();
              return of(true);
            }
          }),
          takeUntilDestroyed(this._destroyRef)
        )
        .subscribe();
    }

    if (isSignal(shouldConfirmObs)) {
      if (shouldConfirmObs()) {
        this.showConfirmDialog().subscribe();
      } else {
        this.confirmed.emit();
      }
    }

    if (shouldConfirmObs) {
      this.showConfirmDialog().subscribe();
    } else {
      this.confirmed.emit();
    }
  }

  private showConfirmDialog(): Observable<boolean> {
    const config = this.getDialogConfig();

    // Open dialog immediately and handle result with captured callbacks
    const dialogRef = this._dialogService.openConfirmDialog(config);

    return dialogRef.closed$.pipe(
      take(1),
      tap(confirmed => {
        // Use captured callbacks that work even if directive is destroyed
        if (confirmed) {
          this.confirmed.emit();
        } else {
          this.cancelled.emit();
        }
      }),
      takeUntilDestroyed(this._destroyRef)
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
