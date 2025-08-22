import { HttpEvent, HttpEventType, HttpProgressEvent } from "@angular/common/http";
import { isPlainObject } from "@client/web-shared-utils";
import { filter, map, OperatorFunction } from "rxjs";
import { HttpClientResponse } from "../models/http-client-response";

/**
 * A custom RxJS operator that maps HTTP upload progress events to NgRx event actions.
 * It extracts upload progress events and maps them to the provided progress action creator.
 *
 * @template T The type of the HTTP response data.
 * @template TProgressAction The type of the progress action.
 * @param progressActionCreator A function that creates a progress action from the progress percentage.
 *
 * @returns An RxJS operator function that filters upload progress events,
 *          calculates progress percentage, and maps them to progress actions.
 */
export function mapToUploadProgressAction<T, TProgressAction>(
  progressActionCreator: (progress: number) => TProgressAction
): OperatorFunction<HttpClientResponse<T>, TProgressAction> {
  return source$ =>
    source$.pipe(
      // Filter only upload progress events
      filter((value: HttpClientResponse<T>) => {
        const event = value as HttpEvent<T>;
        return (
          isPlainObject(event) &&
          event.type === HttpEventType.UploadProgress &&
          !!event.total
        );
      }),
      // Map to progress action
      map((value: HttpClientResponse<T>) => {
        const event = value as HttpProgressEvent;

        // Calculate upload progress percentage
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const progress = Math.round((100 * event.loaded) / event.total!);

        // Create and return the progress action
        return progressActionCreator(progress);
      })
    );
}

/**
 * A custom RxJS operator that maps HTTP upload progress events to NgRx event actions
 * with additional metadata about the upload state.
 *
 * @template T The type of the HTTP response data.
 * @template TProgressAction The type of the progress action.
 * @param progressActionCreator A function that creates a progress action from progress data.
 *
 * @returns An RxJS operator function that filters upload progress events,
 *          calculates progress data, and maps them to progress actions.
 */
export function mapToUploadProgressActionWithMetadata<T, TProgressAction>(
  progressActionCreator: (progressData: {
    progress: number;
    loaded: number;
    total: number;
    isComplete: boolean;
  }) => TProgressAction
): OperatorFunction<HttpClientResponse<T>, TProgressAction> {
  return source$ =>
    source$.pipe(
      // Filter only upload progress events
      filter((value: HttpClientResponse<T>) => {
        const event = value as HttpEvent<T>;
        return (
          isPlainObject(event) &&
          event.type === HttpEventType.UploadProgress &&
          !!event.total
        );
      }),
      // Map to progress action with metadata
      map((value: HttpClientResponse<T>) => {
        const event = value as HttpProgressEvent;

        // Calculate upload progress percentage
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const progress = Math.round((100 * event.loaded) / event.total!);
        const isComplete = event.loaded === event.total;

        // Create and return the progress action with metadata
        return progressActionCreator({
          progress,
          loaded: event.loaded,
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          total: event.total!,
          isComplete,
        });
      })
    );
}

/**
 * A custom RxJS operator that maps all HTTP events to NgRx event actions,
 * not just upload progress events. Useful for comprehensive upload tracking.
 *
 * @template T The type of the HTTP response data.
 * @template TEventAction The type of the event action.
 * @param eventActionCreator A function that creates an event action from the HTTP event.
 *
 * @returns An RxJS operator function that maps all HTTP events to event actions.
 */
export function mapToHttpEventAction<T, TEventAction>(
  eventActionCreator: (eventData: {
    type: HttpEventType;
    progress?: number;
    loaded?: number;
    total?: number;
    response?: T;
  }) => TEventAction
): OperatorFunction<HttpClientResponse<T>, TEventAction> {
  return source$ =>
    source$.pipe(
      map((value: HttpClientResponse<T>) => {
        const event = value as HttpEvent<T>;

        const eventData: {
          type: HttpEventType;
          progress?: number;
          loaded?: number;
          total?: number;
          response?: T;
        } = {
          type: event.type,
        };

        // Add progress data for upload/download progress events
        if (
          (event.type === HttpEventType.UploadProgress ||
            event.type === HttpEventType.DownloadProgress) &&
          event.total
        ) {
          eventData.progress = Math.round((100 * event.loaded) / event.total);
          eventData.loaded = event.loaded;
          eventData.total = event.total;
        }

        // Add response data for response events
        if (event.type === HttpEventType.Response && "body" in event) {
          eventData.response = event.body as T;
        }

        return eventActionCreator(eventData);
      })
    );
}
