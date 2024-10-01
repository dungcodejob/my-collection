import { LogEntry } from "../log-entry";
import { LoggingFormatter } from "./logging.formatter";

export class SimpleFormatter implements LoggingFormatter {
  format(logEntry: LogEntry): string {
    const SEPARATOR = " - ";
    let result = "";
    if (logEntry.logWithDate) {
      result += `[${logEntry.date.toLocaleString()}]`;
    }

    result += SEPARATOR + `[${logEntry.level}]`;
    result += SEPARATOR + `Message: ${logEntry.message}`;

    // if (this.extras.length > 0) {
    //   result += SEPARATOR + `Extra Info: ${JSON.stringify(this.extras)}`;
    // }

    return result;
  }
}
