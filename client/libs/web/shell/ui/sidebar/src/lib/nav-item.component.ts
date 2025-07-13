import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { RippleModule } from 'primeng/ripple';
import { NgIconComponent } from '@ng-icons/core';

export interface MenuGroup {
  id: string;
  title: string;
  url?: string;
  items: MenuItem[];
}

export interface MenuItem {
  id: string;
  title: string;
  url?: string;
  icon?: string;
  children?: MenuItem[];
  groups?: MenuGroup[];
  shortcut?: string;
  badge?: number;
  permissionKey?: string;
  isHideChildren?: boolean;
  isShowSubSidebar?: boolean;
  isHidden?: boolean;
}

@Component({
  selector: 'mc-nav-item',
  imports: [RouterModule, ButtonModule, TooltipModule, RippleModule, NgIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (isCollapsed()) {
      <!-- Collapsed state with tooltip -->
      <div class="relative flex w-full items-center">
        <a
          [routerLink]="item().url"
          class="flex h-8 w-8 items-center justify-center rounded-md text-sidebar-foreground outline-none ring-sidebar-ring transition-[margin,opa] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 group-data-[collapsible=icon]:!p-0"
          [class]="{
            'bg-sidebar-accent text-sidebar-accent-foreground': isActive()
          }"
          [pTooltip]="item().title"
          tooltipPosition="right"
          pRipple>
          <ng-icon [name]="item().icon" size="16" />
          <span class="sr-only">{{ item().title }}</span>
        </a>
      </div>
    } @else {
      <!-- Expanded state -->
      <div class="relative flex w-full items-center">
        <a
          [routerLink]="item().url"
          class="flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-none ring-sidebar-ring transition-[margin,opa] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 group-data-[collapsible=icon]:!p-0 group-data-[collapsible=icon]:!size-8 group-data-[collapsible=icon]:justify-center"
          [class]="{
            'bg-sidebar-accent text-sidebar-accent-foreground': isActive()
          }"
          pRipple>
          @if (item().icon) {
            <ng-icon [name]="item().icon" size="16" class="shrink-0" />
          }
          <div class="flex flex-1 overflow-hidden">
            <div class="line-clamp-1 pr-6">{{ item().title }}</div>
          </div>
        </a>
      </div>
    }
  `,
  styles: []
})
export class NavItemComponent {
  readonly item = input.required<MenuItem>();
  readonly isCollapsed = input(false);
  readonly isActive = input(false);
}