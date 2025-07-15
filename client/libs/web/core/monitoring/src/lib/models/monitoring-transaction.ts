/**
 * Transaction monitoring related interfaces and types
 */

export type MonitoringTransactionContext = {
  description?: string;
  tags?: Record<string, string>;
  data?: Record<string, unknown>;
};

export type MonitoringTransaction = {
  setName(name: string): void;
  setTag(key: string, value: string): void;
  setData<T>(key: string, value: T): void;
  setStatus(status: MonitoringTransactionStatus): void;
  finish(): void;
};

export const monitoringTransactionStatuses = {
  Ok: "ok",
  Cancelled: "cancelled",
  Unknown: "unknown",
  InvalidArgument: "invalid_argument",
  DeadlineExceeded: "deadline_exceeded",
  NotFound: "not_found",
  AlreadyExists: "already_exists",
  PermissionDenied: "permission_denied",
  ResourceExhausted: "resource_exhausted",
  FailedPrecondition: "failed_precondition",
  Aborted: "aborted",
  OutOfRange: "out_of_range",
  Unimplemented: "unimplemented",
  Internal: "internal",
  Unavailable: "unavailable",
  DataLoss: "data_loss",
  Unauthenticated: "unauthenticated",
} as const;

export type MonitoringTransactionStatus =
  (typeof monitoringTransactionStatuses)[keyof typeof monitoringTransactionStatuses];
