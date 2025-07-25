import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import { NgIconComponent, provideIcons } from "@ng-icons/core";
import { lucideChevronDown, lucidePlus } from "@ng-icons/lucide";
import type { Team } from "./app-sidebar.component";

@Component({
  selector: "mc-team-switcher",
  imports: [CommonModule, NgIconComponent],
  providers: [provideIcons({ lucideChevronDown, lucidePlus })],
  template: `
    <div class="flex w-full items-center gap-2">
      @if (!isCollapsed()) {
        <div class="flex flex-1 items-center gap-2">
          <div
            class="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800"
          >
            <ng-icon
              class="text-gray-600 dark:text-gray-300"
              size="16"
              [name]="teams()[0]?.logo || 'lucidePlus'"
            />
          </div>
          <div class="flex flex-1 flex-col">
            <span
              class="text-sm font-medium text-gray-900 whitespace-nowrap dark:text-gray-100"
            >
              {{ teams()[0]?.name || "Select Team" }}
            </span>
            <span class="text-xs text-gray-500 dark:text-gray-400">
              {{ teams()[0]?.plan || "Free" }}
            </span>
          </div>
          <ng-icon class="text-gray-400" name="lucideChevronDown" size="16" />
        </div>
      } @else {
        <div
          class="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800"
        >
          <ng-icon
            class="text-gray-600 dark:text-gray-300"
            size="16"
            [name]="teams()[0]?.logo || 'lucidePlus'"
          />
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TeamSwitcherComponent {
  readonly teams = input.required<Team[]>();
  readonly isCollapsed = input.required<boolean>();
}
