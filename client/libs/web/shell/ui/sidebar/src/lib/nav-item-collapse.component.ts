import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  signal,
} from "@angular/core";
import { Router } from "@angular/router";
import { NgIconComponent, provideIcons } from "@ng-icons/core";
import { lucideChevronDown } from "@ng-icons/lucide";
import { BrnTooltipContentDirective } from "@spartan-ng/brain/tooltip";
import { HlmButtonDirective } from "@spartan-ng/helm/button";
import { HlmTooltipComponent, HlmTooltipTriggerDirective } from "@spartan-ng/helm/tooltip";
import { MenuItem, NavItemComponent } from "./nav-item.component";

@Component({
  selector: "mc-nav-item-collapse",
  imports: [
    HlmButtonDirective,
    HlmTooltipComponent,
    HlmTooltipTriggerDirective,
    BrnTooltipContentDirective,
    NavItemComponent,
    NgIconComponent,
  ],
  providers: [provideIcons({ lucideChevronDown })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (isCollapsed()) {
      <!-- Collapsed state with dropdown menu -->
      <div class="relative flex w-full items-center">
        <hlm-tooltip>
          <button
            class="flex h-8 w-8 items-center justify-center rounded-md text-sidebar-foreground outline-none ring-sidebar-ring transition-[margin,opa] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 group-data-[collapsible=icon]:!p-0"
            hlmBtn
            hlmTooltipTrigger
            size="sm"
            type="button"
            variant="ghost"
            [class]="{
              'bg-sidebar-accent text-sidebar-accent-foreground': hasActiveChild(),
            }"
            (click)="toggleExpanded()"
          >
            <ng-icon size="16" [name]="item().icon" />
            <span class="sr-only">{{ item().title }}</span>
          </button>
          <span *brnTooltipContent>{{ item().title }}</span>
        </hlm-tooltip>

        @if (isExpanded()) {
          <div
            class="absolute left-full top-0 ml-2 min-w-48 bg-sidebar border border-sidebar-border rounded-md shadow-lg z-50"
          >
            <div class="p-2">
              <div class="text-sm font-medium text-sidebar-foreground mb-2 px-2">
                {{ item().title }}
              </div>
              @for (child of item().children; track child.id) {
                <mc-nav-item
                  [isActive]="isItemActive(child)"
                  [isCollapsed]="false"
                  [item]="child"
                />
              }
            </div>
          </div>
        }
      </div>
    } @else {
      <!-- Expanded state with collapsible content -->
      <div class="relative flex w-full flex-col">
        <button
          class="flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-none ring-sidebar-ring transition-[margin,opa] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 group-data-[collapsible=icon]:!p-0 group-data-[collapsible=icon]:!size-8 group-data-[collapsible=icon]:justify-center"
          hlmBtn
          type="button"
          variant="ghost"
          [class]="{
            'bg-sidebar-accent text-sidebar-accent-foreground': hasActiveChild(),
          }"
          (click)="toggleExpanded()"
        >
          @if (item().icon) {
            <ng-icon class="shrink-0" size="16" [name]="item().icon" />
          }
          <div class="flex flex-1 overflow-hidden">
            <div class="line-clamp-1 pr-6">{{ item().title }}</div>
          </div>
          <ng-icon
            class="ml-auto transition-transform duration-200 shrink-0"
            name="lucideChevronDown"
            size="16"
            [class.rotate-180]="isExpanded()"
          />
        </button>

        @if (isExpanded()) {
          <div class="relative overflow-hidden">
            <div class="ml-3 border-l border-sidebar-border pl-2 py-0.5">
              @for (child of item().children; track child.id) {
                <mc-nav-item
                  [isActive]="isItemActive(child)"
                  [isCollapsed]="false"
                  [item]="child"
                />
              }
            </div>
          </div>
        }
      </div>
    }
  `,
  styles: [
    `
      .rotate-180 {
        transform: rotate(180deg);
      }
    `,
  ],
})
export class NavItemCollapseComponent {
  readonly item = input.required<MenuItem>();
  readonly isCollapsed = input(false);
  readonly isOpen = input(false);

  private readonly _expanded = signal(false);
  private readonly _router = inject(Router);

  protected readonly isExpanded = computed(() => {
    return this.isOpen() || this._expanded();
  });

  protected toggleExpanded(): void {
    this._expanded.update(value => !value);
  }

  protected isItemActive(item: MenuItem): boolean {
    if (!item.url) {
      return false;
    }
    return this._router.url.startsWith(item.url);
  }

  hasActiveChild(): boolean {
    if (!this.item().children) {
      return false;
    }
    return this.item().children!.some(child => this.isItemActive(child));
  }
}
