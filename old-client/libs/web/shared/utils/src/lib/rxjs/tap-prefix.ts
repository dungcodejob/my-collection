import { Observable } from "rxjs";

export function tapPrefix(action: () => void) {
  return <T>(source$: Observable<T>): Observable<T> => {
    action();
    return source$;
  };
}
