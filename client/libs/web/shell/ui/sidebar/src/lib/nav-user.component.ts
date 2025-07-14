import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import { NgIconComponent, provideIcons } from "@ng-icons/core";
import {
  lucideCreditCard,
  lucideLogOut,
  lucideMoveVertical,
  lucideSettings,
  lucideUser,
} from "@ng-icons/lucide";
import { MenuItem } from "primeng/api";
import { AvatarModule } from "primeng/avatar";
import { ButtonModule } from "primeng/button";
import { MenuModule } from "primeng/menu";
import { TooltipModule } from "primeng/tooltip";

export type User = {
  name: string;
  email: string;
  avatar: string;
}

@Component({
  selector: "mc-nav-user",
  imports: [ButtonModule, AvatarModule, MenuModule, TooltipModule, NgIconComponent],
  providers: [
    provideIcons({
      lucideMoveVertical,
      lucideUser,
      lucideSettings,
      lucideCreditCard,
      lucideLogOut,
    }),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex items-center gap-2 px-1 py-1.5">
      @if (!isCollapsed()) {
        <div class="flex items-center gap-2 flex-1 min-w-0">
          <p-avatar
            class="size-8 rounded-lg"
            shape="circle"
            size="normal"
            [image]="user().avatar"
            [label]="getInitials(user().name)"
          />
          <div class="grid flex-1 text-left text-sm leading-tight">
            <span class="truncate font-semibold text-sidebar-foreground">
              {{ user().name }}
            </span>
            <span class="truncate text-xs text-sidebar-muted-foreground">
              {{ user().email }}
            </span>
          </div>
        </div>

        <button
          class="ml-auto flex size-4 shrink-0 items-center justify-center rounded-sm text-sidebar-muted-foreground outline-none ring-sidebar-ring transition-[margin,opa] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 group-data-[collapsible=icon]:hidden"
          type="button"
          (click)="menu.toggle($event)"
        >
          <ng-icon name="lucideMoveVertical" size="12" />
        </button>

        <p-menu #menu [model]="menuItems" [popup]="true" />
      } @else {
        <div class="flex size-8 items-center justify-center rounded-sm">
          <p-avatar
            class="size-8 rounded-lg cursor-pointer"
            shape="circle"
            size="normal"
            tooltipPosition="right"
            [image]="user().avatar"
            [label]="getInitials(user().name)"
            [pTooltip]="user().name"
            (click)="menu.toggle($event)"
          />

          <p-menu #menu [model]="menuItems" [popup]="true" />
        </div>
      }
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        width: 100%;
      }

      .cursor-pointer {
        cursor: pointer;
      }
    `,
  ],
})
export class NavUserComponent {
  readonly user = input.required<User>();
  readonly isCollapsed = input(false);

  protected readonly menuItems: MenuItem[] = [
    {
      label: "Profile",
      template: '<ng-icon name="lucideUser" size="16" class="mr-2" />Profile',
      command: () => this.navigateToProfile(),
    },
    {
      label: "Settings",
      template: '<ng-icon name="lucideSettings" size="16" class="mr-2" />Settings',
      command: () => this.navigateToSettings(),
    },
    {
      label: "Billing",
      template: '<ng-icon name="lucideCreditCard" size="16" class="mr-2" />Billing',
      command: () => this.navigateToBilling(),
    },
    {
      separator: true,
    },
    {
      label: "Logout",
      template: '<ng-icon name="lucideLogOut" size="16" class="mr-2" />Logout',
      command: () => this.logout(),
    },
  ];

  protected getInitials(name: string): string {
    return name
      .split(" ")
      .map(word => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }

  protected navigateToProfile(): void {
    console.log("Navigate to profile");
  }

  protected navigateToSettings(): void {
    console.log("Navigate to settings");
  }

  protected navigateToBilling(): void {
    console.log("Navigate to billing");
  }

  protected logout(): void {
    console.log("Logout user");
  }
}
