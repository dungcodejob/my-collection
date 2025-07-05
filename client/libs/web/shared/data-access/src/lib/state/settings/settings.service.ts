import { Injectable } from "@angular/core";
import { ThemeMode } from "@client/web-shared-services";
import { UserSettings } from "../../models/user-settings";

@Injectable()
export class SettingsService {
  getDefaultSettings(): UserSettings {
    return {
      theme: ThemeMode.Default,
      language: "en",
      viewMode: "list",
      fontSize: "medium",
      sortBy: "dateAdded",
      autoCategorize: false,
      autoDeleteAfter: "never",
      showDescription: true,
      cloudSync: false,
      exportFormat: "json",
      syncFrequency: "manual",
      appLock: "none",
      privateBookmarks: false,
      twoFactorAuth: false,
      notifyExpiration: false,
      notifySync: false,
      pushNotifications: true,
      browserExtension: false,
      thirdPartyIntegrations: [],
      shareOptions: ["link"],
      cacheLimit: "500MB",
      customTags: true,
      clearLocalData: false,
      timezone: "UTC",
    };
  }

  getInitialSettingsForNewUser(): UserSettings {
    return {
      ...this.getDefaultSettings(),
      timezone: this.getUserTimezone(),
      language: navigator.language.startsWith("vi") ? "vi" : "en",
    };
  }

  private getUserTimezone(): string {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  }
}
