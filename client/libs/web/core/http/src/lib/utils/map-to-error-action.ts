import { catchError, of, OperatorFunction } from "rxjs";

/**
 * Maps HTTP errors to NgRx event actions using the provided error action creator.
 * This operator catches errors in the stream and transforms them into NgRx actions,
 * allowing for consistent error handling in NgRx effects.
 *
 * @template TErrorAction - The type of the error action(s) to be created (can be a single action or array of actions)
 * @param errorActionCreator - A function that takes an error and returns an NgRx action or array of actions
 * @returns An RxJS operator that catches errors and emits the corresponding error action(s)
 *
 * @example
 * ```typescript
 * // Single action example
 * createCollection$ = withEffects(() => {
 *   return this.actions$.pipe(
 *     ofType(CollectionEvents.createCollection),
 *     switchMap(({ collection }) =>
 *       this.collectionService.create(collection).pipe(
 *         map(response => CollectionEvents.createCollectionSuccess({ collection: response })),
 *         mapToErrorAction(error => CollectionEvents.createCollectionError({ error }))
 *       )
 *     )
 *   );
 * });
 *
 * // Multiple actions example
 * updateCollection$ = withEffects(() => {
 *   return this.actions$.pipe(
 *     ofType(CollectionEvents.updateCollection),
 *     switchMap(({ collection }) =>
 *       this.collectionService.update(collection).pipe(
 *         map(response => CollectionEvents.updateCollectionSuccess({ collection: response })),
 *         mapToErrorAction(error => [
 *           CollectionEvents.updateCollectionError({ error }),
 *           NotificationEvents.showError({ message: 'Failed to update collection' })
 *         ])
 *       )
 *     )
 *   );
 * });
 * ```
 */
export function mapToErrorAction<TErrorAction>(
  errorActionCreator: (error: unknown) => TErrorAction
): OperatorFunction<unknown, unknown> {
  return catchError((error: unknown) => {
    // Map the error to the provided error action
    const errorAction = errorActionCreator(error);

    // Return the error action as an observable and complete
    return of(errorAction);
  });
}
