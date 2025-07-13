/**
 * User context interface for monitoring
 */

export interface MonitoringUserContext {
  id: string;
  email?: string;
  username?: string;
  ipAddress?: string;
  segment?: string;
  [key: string]: any;
}
