import { ChangeDetectionStrategy, Component, signal } from "@angular/core";
import { NgIconComponent, provideIcons } from "@ng-icons/core";
import {
  lucideBook,
  lucideChartBar,
  lucideChevronLeft,
  lucideChevronRight,
  lucideCreditCard,
  lucideDatabase,
  lucideSettings,
  lucideShoppingBag,
  lucideSlidersHorizontal,
  lucideSmartphone,
  lucideTrendingUp,
  lucideUser,
  lucideUsers,
} from "@ng-icons/lucide";
import { ButtonModule } from "primeng/button";
import { DividerModule } from "primeng/divider";
import { TooltipModule } from "primeng/tooltip";
import { NavGroupComponent } from "./nav-group.component";
import { MenuItem } from "./nav-item.component";
import { NavUserComponent, User } from "./nav-user.component";
import { Team, TeamSwitcherComponent } from "./team-switcher.component";

@Component({
  selector: "mc-app-sidebar",
  imports: [
    ButtonModule,
    DividerModule,
    TooltipModule,
    NavGroupComponent,
    TeamSwitcherComponent,
    NavUserComponent,
    NgIconComponent,
  ],
  providers: [
    provideIcons({
      lucideChevronRight,
      lucideChevronLeft,
      lucideShoppingBag,
      lucideDatabase,
      lucideSlidersHorizontal,
      lucideChartBar,
      lucideSmartphone,
      lucideBook,
      lucideSettings,
      lucideUser,
      lucideUsers,
      lucideCreditCard,
      lucideTrendingUp,
    }),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      aria-label="Main navigation"
      class="group/sidebar relative flex h-full w-full flex-col bg-sidebar text-sidebar-foreground transition-all duration-300 ease-in-out"
      role="navigation"
      [attr.aria-expanded]="!isCollapsed()"
      [attr.data-collapsible]="'icon'"
      [attr.data-state]="isCollapsed() ? 'collapsed' : 'expanded'"
      [class]="{
        'w-16': isCollapsed(),
        'w-64': !isCollapsed(),
      }"
    >
      <!-- Sidebar Header -->
      <div class="flex h-14 items-center border-b border-sidebar-border px-4">
        <mc-team-switcher [isCollapsed]="isCollapsed()" [teams]="teams" />
      </div>

      <!-- Separator -->
      <div class="h-px bg-sidebar-border"></div>

      <!-- Sidebar Content -->
      <div class="flex flex-1 flex-col gap-2 overflow-y-auto p-2">
        <mc-nav-group title="Main" [isCollapsed]="isCollapsed()" [items]="navMain" />
        <mc-nav-group title="Other" [isCollapsed]="isCollapsed()" [items]="navOthers" />
      </div>

      <!-- Separator -->
      <div class="h-px bg-sidebar-border"></div>

      <!-- Sidebar Footer -->
      <div class="border-t border-sidebar-border p-2">
        <mc-nav-user [isCollapsed]="isCollapsed()" [user]="user" />
      </div>

      <!-- Sidebar Rail (Toggle button) -->
      <div
        class="absolute inset-y-0 -right-4 z-20 hidden w-4 translate-x-1/2 transition-all group-data-[collapsible=offcanvas]:translate-x-0 group-data-[side=left]:right-0 group-data-[side=right]:left-0 sm:flex"
      >
        <p-button
          class="absolute top-1/2 h-6 w-6 -translate-y-1/2 rounded-full border border-sidebar-border bg-sidebar shadow-sm transition-all hover:bg-sidebar-accent"
          severity="secondary"
          size="small"
          tooltipPosition="right"
          [attr.aria-label]="isCollapsed() ? 'Expand sidebar' : 'Collapse sidebar'"
          [pTooltip]="isCollapsed() ? 'Expand sidebar' : 'Collapse sidebar'"
          [rounded]="true"
          (onClick)="toggleSidebar()"
        >
          <ng-icon
            class="text-sidebar-foreground"
            size="12"
            [name]="isCollapsed() ? 'lucideChevronRight' : 'lucideChevronLeft'"
          />
        </p-button>
      </div>
    </div>
  `,
  styleUrl: "./app-sidebar.css",
})
export class AppSidebarComponent {
  protected readonly isCollapsed = signal(false);

  protected readonly teams: Team[] = [
    {
      name: "Acme Inc",
      logo: "/assets/team-acme.png",
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: "/assets/team-corp.png",
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: "/assets/team-evil.png",
      plan: "Free",
    },
  ];

  protected readonly user: User = {
    name: "John Doe",
    email: "john@example.com",
    avatar: "/assets/avatar.jpg",
  };

  protected readonly navMain: MenuItem[] = [
    {
      id: "1",
      title: "Products",
      icon: "lucideShoppingBag",
      children: [
        {
          id: "1-1",
          title: "Products List",
          icon: "lucideShoppingBag",
          url: "/products",
        },
        {
          id: "1-2",
          title: "Product Categories",
          icon: "lucideDatabase",
          url: "/products/categories",
        },
        {
          id: "1-3",
          title: "Product Toppings",
          icon: "lucideSlidersHorizontal",
          url: "/products/toppings",
        },
        {
          id: "1-4",
          title: "Daily Menu",
          icon: "lucideBarChart3",
          url: "/daily-menus",
        },
      ],
    },
    {
      id: "2",
      title: "Models",
      icon: "lucideSmartphone",
      children: [
        {
          id: "2-1",
          title: "Genesis",
          url: "/models/genesis",
        },
        {
          id: "2-2",
          title: "Explorer",
          url: "/models/explorer",
        },
        {
          id: "2-3",
          title: "Quantum",
          url: "/models/quantum",
        },
      ],
    },
    {
      id: "3",
      title: "Documentation",
      icon: "lucideBook",
      children: [
        {
          id: "3-1",
          title: "Introduction",
          url: "/docs/intro",
        },
        {
          id: "3-2",
          title: "Get Started",
          url: "/docs/getting-started",
        },
        {
          id: "3-3",
          title: "Tutorials",
          url: "/docs/tutorials",
        },
        {
          id: "3-4",
          title: "Changelog",
          url: "/docs/changelog",
        },
      ],
    },
  ];

  protected readonly navOthers: MenuItem[] = [
    {
      id: "4",
      title: "Integration",
      icon: "lucideSlidersHorizontal",
      url: "/integrations",
    },
    {
      id: "5",
      title: "Settings",
      icon: "lucideSettings",
      url: "/settings",
      children: [
        {
          id: "5-1",
          title: "General",
          icon: "lucideUser",
          url: "/settings/general",
        },
        {
          id: "5-2",
          title: "Team",
          icon: "lucideUsers",
          url: "/settings/team",
        },
        {
          id: "5-3",
          title: "Billing",
          icon: "lucideCreditCard",
          url: "/settings/billing",
        },
        {
          id: "5-4",
          title: "Limits",
          icon: "lucideTrendingUp",
          url: "/settings/limits",
        },
      ],
    },
  ];

  protected toggleSidebar(): void {
    this.isCollapsed.update(value => !value);
  }
}
