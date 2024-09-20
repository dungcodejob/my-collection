// Rx
import { Observable, of } from "rxjs";

// Project
import { LogEntry } from "./log-entry";
import { Logger } from "./logger";

export class RemoteLogger implements Logger {
  log(entry: LogEntry): Observable<boolean> {
    // eslint-disable-next-line no-console
    console.log(entry.buildLogMessage(), ...entry.extras);
    return of(true);
  }
  clear(): Observable<boolean> {
    // eslint-disable-next-line no-console
    console.clear();
    return of(true);
  }
}
