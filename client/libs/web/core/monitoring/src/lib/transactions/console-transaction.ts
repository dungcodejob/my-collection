import {
  MonitoringTransaction,
  MonitoringTransactionContext,
  MonitoringTransactionStatus,
} from "../models";

/**
 * Console implementation of Transaction interface
 */
export class ConsoleTransaction implements MonitoringTransaction {
  private _startTime: number;
  private _name: string;
  private _tags: Record<string, string> = {};
  private _data: Record<string, unknown> = {};
  private _status?: MonitoringTransactionStatus;

  constructor(name: string, context?: MonitoringTransactionContext) {
    this._name = name;
    this._startTime = performance.now();

    if (context?.tags) {
      this._tags = { ...context.tags };
    }
    if (context?.data) {
      this._data = { ...context.data };
    }

    console.group(`🚀 Transaction started: ${name}`);
    if (context?.description) {
      console.log("Description:", context.description);
    }
    if (Object.keys(this._tags).length > 0) {
      console.log("Tags:", this._tags);
    }
    if (Object.keys(this._data).length > 0) {
      console.log("Data:", this._data);
    }
    console.groupEnd();
  }

  setName(name: string): void {
    console.log(`📝 Transaction name changed: ${this._name} → ${name}`);
    this._name = name;
  }

  setTag(key: string, value: string): void {
    this._tags[key] = value;
    console.log(`🏷️ Transaction tag set: ${key} = ${value}`);
  }

  setData<T>(key: string, value: T): void {
    this._data[key] = value;
    console.log(`📊 Transaction data set: ${key} =`, value);
  }

  setStatus(status: MonitoringTransactionStatus): void {
    this._status = status;
    console.log(`📊 Transaction status set: ${status}`);
  }

  finish(): void {
    const duration = performance.now() - this._startTime;
    const statusIcon = this.getStatusIcon(this._status);

    console.group(`${statusIcon} Transaction finished: ${this._name}`);
    console.log(`Duration: ${duration.toFixed(2)}ms`);
    if (this._status) {
      console.log("Status:", this._status);
    }
    if (Object.keys(this._tags).length > 0) {
      console.log("Final tags:", this._tags);
    }
    if (Object.keys(this._data).length > 0) {
      console.log("Final data:", this._data);
    }
    console.groupEnd();
  }

  private getStatusIcon(status?: MonitoringTransactionStatus): string {
    switch (status) {
      case "ok":
        return "✅";
      case "cancelled":
        return "🚫";
      case "deadline_exceeded":
        return "⏰";
      case "not_found":
        return "🔍";
      case "permission_denied":
        return "🔒";
      case "internal":
        return "💥";
      default:
        return "🏁";
    }
  }
}
