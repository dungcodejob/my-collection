import { Injectable } from "@angular/core";
import { EnvConfig, OnInitConfig } from "@core/config";
import { LogEntry, LogLevel } from "./log-entry";
import { injectLoggingDestination, injectLoggingFormatter } from "./log.provide";

@Injectable({
  providedIn: "root",
})
export class LogService implements OnInitConfig {
  private readonly _formatter = injectLoggingFormatter();
  private readonly _destinations = injectLoggingDestination();
  private readonly _level: LogLevel = LogLevel.All;

  configure(config: EnvConfig): void {
    if (config.env != "dev") {
    }
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
    if (this._hasPermissionToLog(level)) {
      const entry = new LogEntry();
      entry.level = level;
      entry.message = message;
      entry.extras = params;

      const str = this._formatter.format(entry);
      for (const destination of this._destinations) {
        destination.log(str);
      }
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
