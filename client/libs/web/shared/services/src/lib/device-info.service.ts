import { inject, Injectable } from "@angular/core";
import { STORAGE_KEYS } from "@client/web-shared-constants";
import { v4 as uuidv4 } from "uuid"; // Cài đặt: npm install uuid @types/uuid
import { StorageService } from "./storage.service";

@Injectable({
  providedIn: "root",
})
export class DeviceInfoService {
  private readonly _storageService = inject(StorageService);

  getDeviceId(): string | null {
    const deviceIdStorage = this._storageService.use<string>(STORAGE_KEYS.DEVICE_ID);
    let deviceId = deviceIdStorage.get();
    if (!deviceId) {
      deviceId = uuidv4();
      deviceIdStorage.set(deviceId);
    }
    return deviceId;
  }

  getOsVersion(): string {
    const userAgent = navigator.userAgent;
    if (userAgent.includes("Windows")) {
      return "Windows";
    }
    if (userAgent.includes("Mac OS")) {
      return "MacOS";
    }
    if (userAgent.includes("Android")) {
      return "Android";
    }
    if (userAgent.includes("iPhone") || userAgent.includes("iPad")) {
      return "iOS";
    }
    return "Unknown";
  }

  getAppVersion(): string {
    return "1.0.0";
  }
}
