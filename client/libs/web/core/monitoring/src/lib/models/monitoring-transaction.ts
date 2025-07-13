/**
 * Transaction monitoring related interfaces and types
 */

export type MonitoringTransactionContext = {
  description?: string;
  tags?: Record<string, string>;
  data?: Record<string, any>;
};

export type MonitoringTransaction = {
  setName(name: string): void;
  setTag(key: string, value: string): void;
  setData<T>(key: string, value: T): void;
  setStatus(status: MonitoringTransactionStatus): void;
  finish(): void;
};

export type MonitoringTransactionStatus =
  | "ok"
  | "cancelled"
  | "unknown"
  | "invalid_argument"
  | "deadline_exceeded"
  | "not_found"
  | "already_exists"
  | "permission_denied"
  | "resource_exhausted"
  | "failed_precondition"
  | "aborted"
  | "out_of_range"
  | "unimplemented"
  | "internal"
  | "unavailable"
  | "data_loss"
  | "unauthenticated";
