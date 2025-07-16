import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, input, signal } from "@angular/core";
import { NgIconComponent, provideIcons } from "@ng-icons/core";
import { lucideChevronDown, lucideChevronRight } from "@ng-icons/lucide";
import type { MenuItem } from "./app-sidebar.component";

@Component({
  selector: "mc-nav-group",
  imports: [CommonModule, NgIconComponent],
  providers: [provideIcons({ lucideChevronDown, lucideChevronRight })],
  template: `
    <div class="space-y-1">
      @if (!isCollapsed() && title()) {
        <h3
          class="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400"
        >
          {{ title() }}
        </h3>
      }

      @for (item of items(); track item.id) {
        <div class="space-y-1">
          <!-- Main menu item -->
          <button
            class="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-100"
            type="button"
            [class.justify-center]="isCollapsed()"
            (click)="toggleExpanded(item.id)"
          >
            @if (item.icon) {
              <ng-icon class="shrink-0" size="16" [name]="item.icon" />
            }

            @if (!isCollapsed()) {
              <span class="flex-1">{{ item.title }}</span>

              @if (item.children && item.children.length > 0) {
                <ng-icon
                  class="shrink-0 text-gray-400"
                  size="16"
                  [name]="
                    isExpanded(item.id) ? 'lucideChevronDown' : 'lucideChevronRight'
                  "
                />
              }

              @if (item.shortcut) {
                <kbd
                  class="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-gray-100 px-1.5 font-mono text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                >
                  {{ item.shortcut }}
                </kbd>
              }
            }
          </button>

          <!-- Submenu items -->
          @if (
            item.children &&
            item.children.length > 0 &&
            isExpanded(item.id) &&
            !isCollapsed()
          ) {
            <div
              class="ml-6 space-y-1 border-l border-gray-200 pl-3 dark:border-gray-700"
            >
              @for (child of item.children; track child.id) {
                <a
                  class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100"
                  [href]="child.url || '#'"
                >
                  @if (child.icon) {
                    <ng-icon class="shrink-0" size="14" [name]="child.icon" />
                  }
                  <span>{{ child.title }}</span>
                  @if (child.shortcut) {
                    <kbd
                      class="pointer-events-none ml-auto inline-flex h-5 select-none items-center gap-1 rounded border bg-gray-100 px-1.5 font-mono text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                    >
                      {{ child.shortcut }}
                    </kbd>
                  }
                </a>
              }
            </div>
          }
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavGroupComponent {
  readonly title = input<string>();
  readonly items = input.required<MenuItem[]>();
  readonly isCollapsed = input.required<boolean>();

  private readonly _expandedItems = signal<Set<string>>(new Set());

  protected isExpanded(itemId: string): boolean {
    return this._expandedItems().has(itemId);
  }

  protected toggleExpanded(itemId: string): void {
    this._expandedItems.update(expanded => {
      const newExpanded = new Set(expanded);
      if (newExpanded.has(itemId)) {
        newExpanded.delete(itemId);
      } else {
        newExpanded.add(itemId);
      }
      return newExpanded;
    });
  }
}
