import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { UserSettings } from "../../models/user-settings";
@Injectable({
  providedIn: "root",
})
export class UserApi {
  private readonly _http = inject(HttpClient);

  getSettings(): Observable<UserSettings> {
    return this._http.get<UserSettings>("api/settings");
  }

  updateSettings(settings: UserSettings): Observable<UserSettings> {
    return this._http.put<UserSettings>("api/settings", settings);
  }
}
