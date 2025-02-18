import { Injectable, Type } from "@angular/core";
import { ExternalToast, toast } from "ngx-sonner";

type ExtraToast = ExternalToast & {
  params: (string | number | boolean)[];
};

@Injectable({ providedIn: "root" })
export class ToastService {
  error(message: string | Type<unknown>, data?: ExtraToast) {
    const format = this._format(message, data?.params);
    const description = this._getTimeDescription();
    toast.error(format, { description, ...data });
  }
  success(message: string | Type<unknown>, data?: ExtraToast) {
    const format = this._format(message, data?.params);
    const description = this._getTimeDescription();
    toast.success(format, { description, ...data });
  }

  show(message: string | Type<unknown>, data?: ExtraToast) {
    const format = this._format(message, data?.params);
    const description = this._getTimeDescription();
    toast(format, { description, ...data });
  }

  private _format(
    message: string | Type<unknown>,
    params?: (string | number | boolean)[]
  ) {
    if (typeof message === "string" && params && params.length > 0) {
      return message.replace(/{(\d+)}/g, (match, index) => {
        return typeof params[index] !== "undefined" ? params[index].toString() : match;
      });
    }

    return message;
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
