import { HttpEvent, HttpResponse } from "@angular/common/http";


/**
 * Union type for the possible values emitted by HttpClient observables,
 * depending on the 'observe' option used.
 * @template T The expected type of the response body.
 */
export type HttpClientResponse<T> = HttpEvent<T> | T | HttpResponse<T>