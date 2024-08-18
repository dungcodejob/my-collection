import { Injectable, Type } from "@angular/core";
import { ExternalToast, toast } from "ngx-sonner";

type ExtraToast = ExternalToast & {
  params: any[];
};

@Injectable({ providedIn: "root" })
export class ToastService {
  constructor() {}

  error(message: string | Type<unknown>, data?: ExtraToast) {
    let format = message;
    if (typeof message === "string" && data) {
      format = message.replace(/{(\d+)}/g, (match, index) => {
        return typeof data.params[index] !== "undefined" ? data.params[index] : match;
      });
    }
    const description = this._getTimeDescription();
    toast.error(message, { description, ...data });
  }
  success(message: string | Type<unknown>, data?: ExtraToast) {
    let format = message;
    if (typeof message === "string" && data) {
      format = message.replace(/{(\d+)}/g, (match, index) => {
        return typeof data.params[index] !== "undefined" ? data.params[index] : match;
      });
    }
    const description = this._getTimeDescription();
    toast.success(message, { description, ...data });
  }

  show(message: string | Type<unknown>, data?: ExternalToast) {
    const description = this._getTimeDescription();
    toast(message, { description, ...data });
  }

  private _getTimeDescription() {
    // Example: Thursday, April 04, 2024 at 8:25 PM
    const now = new Date();
    return now.toLocaleString("en-US", {
      weekday: "long",
      month: "long",
      day: "2-digit",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });
  }
}
