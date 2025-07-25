import { ThemeMode } from "@client/web-shared-services";

export type UserSettings = {
  theme: ThemeMode;
  language: "vi" | "en";
  viewMode: "list" | "grid" | "card";
  fontSize: "small" | "medium" | "large";
  sortBy: "dateAdded" | "title" | "custom";
  autoCategorize: boolean;
  autoDeleteAfter: "never" | "30days" | "90days";
  showDescription: boolean;
  cloudSync: boolean;
  exportFormat: "json" | "csv";
  syncFrequency: "manual" | "hourly" | "daily";
  appLock: "none" | "password" | "biometric";
  privateBookmarks: boolean;
  twoFactorAuth: boolean;
  notifyExpiration: boolean;
  notifySync: boolean;
  pushNotifications: boolean;
  browserExtension: boolean;
  thirdPartyIntegrations: string[];
  shareOptions: ("email" | "social" | "link")[];
  cacheLimit: "100MB" | "500MB" | "1GB";
  customTags: boolean;
  clearLocalData: boolean;
  timezone: string;
};
