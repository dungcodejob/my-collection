import { Observable } from "rxjs";
import { LogEntry } from "./log-entry";

export interface Logger {
  log(entry: LogEntry): Observable<boolean>;
  clear(): Observable<boolean>;
}
