import { Observable } from "rxjs";

export function prefix(action: () => void) {
  return <T>(source$: Observable<T>): Observable<T> => {
    action();
    return source$;
  };
}
