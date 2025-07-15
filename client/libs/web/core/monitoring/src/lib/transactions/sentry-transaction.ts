import * as Sentry from "@sentry/angular";
import { MonitoringTransaction, MonitoringTransactionStatus } from "../models";

/**
 * Wrapper for Sentry span to implement our Transaction interface
 */

type SentrySpan = Sentry.Span;
type SentryStatus = Parameters<SentrySpan["setStatus"]>[0];

export class SentryTransaction implements MonitoringTransaction {
  constructor(private sentrySpan: SentrySpan) {}

  setName(name: string): void {
    this.sentrySpan.updateName(name);
  }

  setTag(key: string, value: string): void {
    this.sentrySpan.setAttribute(key, value);
  }

  setData<T>(key: string, value: T): void {
    this.sentrySpan.setAttribute(key, value as string | number | boolean);
  }

  setStatus(status: MonitoringTransactionStatus): void {
    // Map our status to Sentry's SpanStatus
    const sentryStatus = this.mapStatusToSentry(status);
    this.sentrySpan.setStatus(sentryStatus);
  }

  finish(): void {
    this.sentrySpan.end();
  }

  private mapStatusToSentry(status: MonitoringTransactionStatus): SentryStatus {
    const mapping: Record<MonitoringTransactionStatus, SentryStatus> = {
      ok: { code: 1, message: "ok" },
      cancelled: { code: 2, message: "cancelled" },
      unknown: { code: 0, message: "unknown_error" },
      invalid_argument: { code: 2, message: "invalid_argument" },
      deadline_exceeded: { code: 2, message: "deadline_exceeded" },
      not_found: { code: 2, message: "not_found" },
      already_exists: { code: 2, message: "already_exists" },
      permission_denied: { code: 2, message: "permission_denied" },
      resource_exhausted: { code: 2, message: "resource_exhausted" },
      failed_precondition: { code: 2, message: "failed_precondition" },
      aborted: { code: 2, message: "aborted" },
      out_of_range: { code: 2, message: "out_of_range" },
      unimplemented: { code: 2, message: "unimplemented" },
      internal: { code: 2, message: "internal_error" },
      unavailable: { code: 2, message: "unavailable" },
      data_loss: { code: 2, message: "data_loss" },
      unauthenticated: { code: 2, message: "unauthenticated" },
    };
    return mapping[status] || { code: 0, message: "unknown_error" };
  }
}
