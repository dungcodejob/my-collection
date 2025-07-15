export type MonitoringUserContext = {
  id: string;
  email?: string;
  username?: string;
  ipAddress?: string;
  segment?: string;
  [key: string]: unknown;
};
