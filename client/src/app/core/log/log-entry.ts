export enum LogLevel {
  All = "all",
  Debug = "debug",
  Info = "info",
  Warn = "warn",
  Error = "error",
  Fatal = "fatal",
  Off = "off",
}

export class LogEntry {
  date = new Date();
  message = "";
  level = LogLevel.Debug;
  extras: unknown[] = [];
  logWithDate = true;

  buildLogMessage(): string {
    const SEPARATOR = " - ";
    let result = "";
    if (this.logWithDate) {
      result += `[${this.date.toLocaleString()}]`;
    }

    result += SEPARATOR + `[${this.level}]`;
    result += SEPARATOR + `Message: ${this.message}`;

    // if (this.extras.length > 0) {
    //   result += SEPARATOR + `Extra Info: ${JSON.stringify(this.extras)}`;
    // }

    return result;
  }
}
