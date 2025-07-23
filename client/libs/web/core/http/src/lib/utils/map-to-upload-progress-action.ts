import { OperatorFunction, tap } from "rxjs";
import { EventInstance } from "@my-collection/web/core/ngrx-signals";

/**
 * Action creator interface for NgRx Signal actions
 * 
 * CONTEXT: NgRx Signals Action Creation
 * PATTERN: Type-safe Action Creator Interface
 * 
 * @deprecated Use EventInstance action creators from eventGroup instead
 * @category Legacy Support
 */
export interface ActionCreator<T = any> {
  (payload: T): any;
}

/**
 * Maps HTTP upload progress events to NgRx Signal progress actions with real-time updates
 * 
 * CONTEXT: NgRx Signals File Upload Progress Tracking
 * PATTERN: Progress Event Extraction and Action Dispatch with Side Effects
 * RELATED: mapToSuccessAction, mapToErrorAction, tapUploadProgress
 * STRATEGY: Extract progress from HTTP events and dispatch progress actions for UI updates
 * 
 * This operator handles file upload progress tracking:
 * - Extracts progress percentage from HTTP upload events
 * - Dispatches progress actions for real-time UI updates (progress bars, percentages)
 * - Supports optional callback for additional side effects (analytics, logging)
 * - Works with Angular HttpClient upload events and custom progress responses
 * 
 * @category HTTP Progress Tracking
 * @subcategory File Upload
 * @version 2.0.0
 * 
 * @example
 * ```typescript
 * // Basic file upload with progress tracking
 * this.http.post('/api/files/upload', formData, {
 *   reportProgress: true,
 *   observe: 'events'
 * }).pipe(
 *   mapToUploadProgressAction(fileActions.uploadProgress),
 *   mapToSuccessAction(fileActions.uploadSuccess),
 *   mapToErrorAction(fileActions.uploadError)
 * )
 * 
 * // With progress bar updates and analytics
 * this.http.post('/api/documents/upload', documentData, {
 *   reportProgress: true,
 *   observe: 'events'
 * }).pipe(
 *   mapToUploadProgressAction(
 *     documentActions.uploadProgress,
 *     (progress) => {
 *       this.updateProgressBar(progress);
 *       this.analytics.trackUploadProgress(progress);
 *     }
 *   ),
 *   mapToSuccessAction(documentActions.uploadSuccess)
 * )
 * 
 * // Multiple file upload with individual progress tracking
 * files.forEach((file, index) => {
 *   this.http.post(`/api/files/upload/${index}`, file, {
 *     reportProgress: true,
 *     observe: 'events'
 *   }).pipe(
 *     mapToUploadProgressAction(
 *       (progress) => fileActions.uploadProgress({ fileIndex: index, progress }),
 *       (progress) => this.updateFileProgress(index, progress)
 *     )
 *   ).subscribe();
 * });
 * ```
 * 
 * @param progressActionCreator Action creator that creates progress update actions
 * @param callback Optional callback for side effects (UI updates, analytics, logging)
 * @returns RxJS operator that extracts progress and dispatches progress actions
 * 
 * ERROR_HANDLING: Does not handle errors - use with mapToErrorAction for error handling
 * SIDE_EFFECT: Optional callback executed for each progress update
 * RETURN: Observable<T> - passes through original response while dispatching progress actions
 */
export function mapToUploadProgressAction<T>(
  progressActionCreator: ActionCreator<{ progress: number }>,
  callback?: (progress: number) => void
): OperatorFunction<T, T> {
  return tap((response: T) => {
    // STEP 1: Extract progress percentage from response
    // PATTERN: Progress extraction with fallback to 0 for safety
    // NOTE: Assumes response has a progress property (HttpProgressEvent.loaded/total * 100)
    const progress = (response as any)?.progress || 0;
    
    // STEP 2: Execute optional side effects for UI updates and analytics
    // PATTERN: Side effect execution for progress bar updates, notifications, analytics
    if (callback) {
      callback(progress);
    }
    
    // STEP 3: Dispatch progress action to update NgRx Signal store
    // PATTERN: Progress action dispatch with structured payload
    // PAYLOAD: { progress: number } - standardized progress payload format
    progressActionCreator({ progress });
  });
}