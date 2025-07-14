import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import { Router } from "@angular/router";
import { NavItemCollapseComponent } from "./nav-item-collapse.component";
import { MenuItem, NavItemComponent } from "./nav-item.component";

@Component({
  selector: "mc-nav-group",
  imports: [NavItemComponent, NavItemCollapseComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="group flex flex-col gap-4 py-2"
      [attr.data-collapsed]="isCollapsed()"
      [class]="{
        'group-data-[collapsed=true]:py-2': isCollapsed(),
      }"
    >
      <nav
        class="flex flex-col gap-1 px-2 group-data-[collapsed=true]:justify-center group-data-[collapsed=true]:px-2"
      >
        @if (!isCollapsed()) {
          <div
            class="relative flex w-full items-center px-2 py-1 text-xs font-medium text-sidebar-foreground/70"
          >
            {{ title() }}
          </div>
        }
        @for (item of items(); track item.id) {
          @if (item.children && item.children.length > 0) {
            <mc-nav-item-collapse
              [isCollapsed]="isCollapsed()"
              [isOpen]="isOpen()"
              [item]="item"
            />
          } @else {
            <mc-nav-item
              [isActive]="isItemActive(item)"
              [isCollapsed]="isCollapsed()"
              [item]="item"
            />
          }
        }
      </nav>
    </div>
  `,
  styles: [
    `
      .group.collapsed {
        @apply data-[collapsed=true]:py-2;
      }

      .group.collapsed nav {
        @apply justify-center px-2;
      }
    `,
  ],
})
export class NavGroupComponent {
  readonly items = input.required<MenuItem[]>();
  readonly title = input.required<string>();
  readonly isCollapsed = input(false);
  readonly isOpen = input(false);

  constructor(private router: Router) {}

  protected isItemActive(item: MenuItem): boolean {
    if (!item.url) {return false;}
    return this.router.url.startsWith(item.url);
  }
}
