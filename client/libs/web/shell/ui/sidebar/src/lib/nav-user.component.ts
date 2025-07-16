import { NgOptimizedImage } from "@angular/common";
import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import { NgIconComponent, provideIcons } from "@ng-icons/core";
import {
  lucideChevronUp,
  lucideLogOut,
  lucideSettings,
  lucideUser,
} from "@ng-icons/lucide";
import type { User } from "./app-sidebar.component";

@Component({
  selector: "mc-nav-user",
  imports: [NgOptimizedImage, NgIconComponent],
  providers: [
    provideIcons({ lucideChevronUp, lucideLogOut, lucideSettings, lucideUser }),
  ],
  template: `
    <div class="flex w-full items-center gap-2">
      @if (!isCollapsed()) {
        <div class="flex flex-1 items-center gap-2">
          <div
            class="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700"
          >
            @if (user().avatar) {
              <img
                class="h-8 w-8 rounded-full object-cover"
                height="40"
                width="40"
                [alt]="user().name"
                [ngSrc]="user().avatar"
              />
            } @else {
              <ng-icon
                class="text-gray-600 dark:text-gray-300"
                name="lucideUser"
                size="16"
              />
            }
          </div>
          <div class="flex flex-1 flex-col">
            <span class="text-sm font-medium text-gray-900 dark:text-gray-100">
              {{ user().name }}
            </span>
            <span class="text-xs text-gray-500 dark:text-gray-400">
              {{ user().email }}
            </span>
          </div>
          <button
            class="flex h-6 w-6 items-center justify-center rounded hover:bg-gray-100 dark:hover:bg-gray-800"
            type="button"
            [attr.aria-label]="'User menu'"
          >
            <ng-icon class="text-gray-400" name="lucideChevronUp" size="14" />
          </button>
        </div>
      } @else {
        <div
          class="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700"
        >
          @if (user().avatar) {
            <img
              class="h-8 w-8 rounded-full object-cover"
              height="40"
              width="40"
              [alt]="user().name"
              [ngSrc]="user().avatar"
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
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavUserComponent {
  readonly user = input.required<User>();
  readonly isCollapsed = input.required<boolean>();
}
