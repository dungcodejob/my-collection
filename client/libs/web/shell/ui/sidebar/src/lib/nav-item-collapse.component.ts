import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  signal,
} from "@angular/core";
import { Router } from "@angular/router";
import { NgIconComponent, provideIcons } from "@ng-icons/core";
import { lucideChevronDown } from "@ng-icons/lucide";
import { ButtonModule } from "primeng/button";
import { RippleModule } from "primeng/ripple";
import { TooltipModule } from "primeng/tooltip";
import { MenuItem, NavItemComponent } from "./nav-item.component";

@Component({
  selector: "mc-nav-item-collapse",
  imports: [ButtonModule, TooltipModule, RippleModule, NavItemComponent, NgIconComponent],
  providers: [provideIcons({ lucideChevronDown })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (isCollapsed()) {
    <!-- Collapsed state with dropdown menu -->
    <div class="relative flex w-full items-center">
      <button
        type="button"
        class="flex h-8 w-8 items-center justify-center rounded-md text-sidebar-foreground outline-none ring-sidebar-ring transition-[margin,opa] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 group-data-[collapsible=icon]:!p-0"
        [class]="{
          'bg-sidebar-accent text-sidebar-accent-foreground': hasActiveChild()
        }"
        [pTooltip]="item().title"
        tooltipPosition="right"
        (click)="toggleExpanded()"
        pRipple
      >
        <ng-icon [name]="item().icon" size="16" />
        <span class="sr-only">{{ item().title }}</span>
      </button>

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
            [item]="child"
            [isCollapsed]="false"
            [isActive]="isItemActive(child)"
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
        type="button"
        class="flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-none ring-sidebar-ring transition-[margin,opa] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 group-data-[collapsible=icon]:!p-0 group-data-[collapsible=icon]:!size-8 group-data-[collapsible=icon]:justify-center"
        [class]="{
          'bg-sidebar-accent text-sidebar-accent-foreground': hasActiveChild()
        }"
        (click)="toggleExpanded()"
        pRipple
      >
        @if (item().icon) {
        <ng-icon [name]="item().icon" size="16" class="shrink-0" />
        }
        <div class="flex flex-1 overflow-hidden">
          <div class="line-clamp-1 pr-6">{{ item().title }}</div>
        </div>
        <ng-icon
          name="lucideChevronDown"
          size="16"
          class="ml-auto transition-transform duration-200 shrink-0"
          [class.rotate-180]="isExpanded()"
        />
      </button>

      @if (isExpanded()) {
      <div class="relative overflow-hidden">
        <div class="ml-3 border-l border-sidebar-border pl-2 py-0.5">
          @for (child of item().children; track child.id) {
          <mc-nav-item
            [item]="child"
            [isCollapsed]="false"
            [isActive]="isItemActive(child)"
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

  private readonly expanded = signal(false);

  constructor(private router: Router) {}

  protected readonly isExpanded = computed(() => {
    return this.isOpen() || this.expanded();
  });

  protected toggleExpanded(): void {
    this.expanded.update(value => !value);
  }

  protected isItemActive(item: MenuItem): boolean {
    if (!item.url) return false;
    return this.router.url.startsWith(item.url);
  }

  hasActiveChild(): boolean {
    if (!this.item().children) return false;
    return this.item().children!.some(child => this.isItemActive(child));
  }
}
