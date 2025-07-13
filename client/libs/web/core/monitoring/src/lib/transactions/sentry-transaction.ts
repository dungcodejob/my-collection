import { MonitoringTransaction, MonitoringTransactionStatus } from "../models";

/**
 * Wrapper for Sentry transaction to implement our Transaction interface
 */
export class SentryTransactionImpl implements MonitoringTransaction {
  constructor(private sentryTransaction: any) {}

  setName(name: string): void {
    this.sentryTransaction.setName(name);
  }

  setTag(key: string, value: string): void {
    this.sentryTransaction.setTag(key, value);
  }

  setData(key: string, value: any): void {
    this.sentryTransaction.setData(key, value);
  }

  setStatus(status: MonitoringTransactionStatus): void {
    this.sentryTransaction.setStatus(status);
  }

  finish(): void {
    this.sentryTransaction.finish();
  }
}
