import { Injectable } from "@angular/core";
import { EnvConfig, OnInitConfig } from "@core/config";
import { LocalLogger } from "./logger/local-logger";
import { LogEntry, LogLevel } from "./logger/log-entry";
import { Logger } from "./logger/logger";
import { RemoteLogger } from "./logger/remote-logger";
@Injectable({
  providedIn: "root",
})
export class LogService implements OnInitConfig {
  private _logger!: Logger;
  readonly _level: LogLevel = LogLevel.All;
  readonly _logWithDate: boolean = true;

  configure(config: EnvConfig): void {
    if (config.env != "dev") {
      this._logger = new LocalLogger();
    }

    this._logger = new RemoteLogger();
  }

  debug(msg: string, ...params: unknown[]) {
    this._write(msg, LogLevel.Debug, params);
  }

  info(msg: string, ...params: unknown[]) {
    this._write(msg, LogLevel.Info, params);
  }

  warn(msg: string, ...params: unknown[]) {
    this._write(msg, LogLevel.Warn, params);
  }

  error(msg: string, ...params: unknown[]) {
    this._write(msg, LogLevel.Error, params);
  }

  fatal(msg: string, ...params: unknown[]) {
    this._write(msg, LogLevel.Fatal, params);
  }

  log(msg: string, ...params: unknown[]) {
    this._write(msg, LogLevel.All, params);
  }

  private _write(message: string, level: LogLevel, params: unknown[]): void {
    if (this._hasPermissionToLog(level) && this._logger != null) {
      const entry = new LogEntry();
      entry.logWithDate = this._logWithDate;
      entry.level = level;
      entry.message = message;
      entry.extras = params;

      this._logger.log(entry);
    }
  }

  private _hasPermissionToLog(level: LogLevel): boolean {
    if (
      (level >= this._level && level !== LogLevel.Off) ||
      this._level === LogLevel.All
    ) {
      return true;
    }
    return false;
  }
}
