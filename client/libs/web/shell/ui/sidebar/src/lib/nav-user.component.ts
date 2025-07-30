import { NgOptimizedImage } from "@angular/common";
import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import { NgIconComponent, provideIcons } from "@ng-icons/core";
import {
  lucideChevronsUpDown,
  lucideLogOut,
  lucideSettings,
  lucideUser,
} from "@ng-icons/lucide";
import { HlmButtonDirective } from "@spartan-ng/helm/button";
import type { User } from "./app-sidebar.component";

@Component({
  selector: "mc-nav-user",
  imports: [NgOptimizedImage, HlmButtonDirective, NgIconComponent],
  providers: [
    provideIcons({ lucideChevronsUpDown, lucideLogOut, lucideSettings, lucideUser }),
  ],
  template: `
    <button
      class="flex w-full items-center gap-2 p-2 h-auto"
      hlmBtn
      type="button"
      variant="ghost"
    >
      @if (!isCollapsed()) {
        <div class="flex flex-1 items-center gap-2">
          <div
            class="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700"
          >
            @let avatar = user().avatar;
            @if (avatar) {
              <img
                class="h-8 w-8 rounded-full object-cover"
                height="40"
                width="40"
                [alt]="user().name"
                [ngSrc]="avatar"
              />
            } @else {
              <span
                class="relative flex size-8 shrink-0 overflow-hidden h-8 w-8 rounded-lg"
              >
                <span
                  class="bg-muted flex size-full items-center justify-center rounded-lg"
                  >CN</span
                >
              </span>
            }
          </div>
          <div class="flex flex-1 flex-col items-start">
            <span class="text-sm font-medium text-gray-900 dark:text-gray-100">
              {{ user().name }}
            </span>
            <span class="text-xs text-gray-500 dark:text-gray-400">
              {{ user().email }}
            </span>
          </div>
          <div
            class="flex h-6 w-6 items-center justify-center rounded hover:bg-gray-100 dark:hover:bg-gray-800"
            [attr.aria-label]="'User menu'"
          >
            <ng-icon class="text-gray-400" name="lucideChevronsUpDown" size="16" />
          </div>
        </div>
      } @else {
        <div
          class="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700"
        >
          @let avatar = user().avatar;
          @if (avatar) {
            <img
              class="h-8 w-8 rounded-full object-cover"
              height="40"
              width="40"
              [alt]="user().name"
              [ngSrc]="avatar"
            />
          } @else {
            <ng-icon
              class="text-gray-600 dark:text-gray-300"
              name="lucideUser"
              size="16"
            />
          }
        </div>
      }
    </button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavUserComponent {
  readonly user = input.required<User>();
  readonly isCollapsed = input.required<boolean>();
}
