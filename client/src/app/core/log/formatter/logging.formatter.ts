import { LogEntry } from "../log-entry";

export interface LoggingFormatter {
  format(entry: LogEntry): string;
}
