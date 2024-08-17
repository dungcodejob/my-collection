// Rx
import { Observable, of } from "rxjs";

// Project
import { LogEntry } from "./log-entry";
import { Logger } from "./logger";

export class LocalLogger implements Logger {
  log(entry: LogEntry): Observable<boolean> {
    console.log(entry.buildLogMessage(), ...entry.extras);
    return of(true);
  }
  clear(): Observable<boolean> {
    console.clear();
    return of(true);
  }
}
