import { animate, state, style, transition, trigger } from "@angular/animations";
import { ChangeDetectionStrategy, Component, signal } from "@angular/core";
import { NgIconComponent, provideIcons } from "@ng-icons/core";
import {
  lucideAudioWaveform,
  lucideBookOpen,
  lucideBot,
  lucideChartPie,
  lucideChevronLeft,
  lucideChevronRight,
  lucideCommand,
  lucideFrame,
  lucideGalleryVerticalEnd,
  lucideSettings2,
} from "@ng-icons/lucide";
import { BrnSeparatorComponent } from "@spartan-ng/brain/separator";
import { HlmSeparatorDirective } from "@spartan-ng/helm/separator";
import { NavGroupComponent } from "./nav-group.component";
import { NavUserComponent } from "./nav-user.component";
import { TeamSwitcherComponent } from "./team-switcher.component";
export type MenuItem = {
  id: string;
  title: string;
  icon?: string;
  url?: string;
  shortcut?: string;
  children?: MenuItem[];
  groups?: MenuGroup[];
  isHidden?: boolean;
  isHideChildren?: boolean;
  isShowSubSidebar?: boolean;
  permissionKey?: string;
};

export type MenuGroup = {
  id: string;
  title: string;
  items: MenuItem[];
};

export type Team = {
  name: string;
  logo: string;
  plan: string;
};

export type User = {
  name: string;
  email: string;
  avatar: string;
};

@Component({
  selector: "mc-app-sidebar",
  imports: [
    NgIconComponent,
    TeamSwitcherComponent,
    NavGroupComponent,
    NavUserComponent,
    BrnSeparatorComponent,
    HlmSeparatorDirective,
  ],
  providers: [
    provideIcons({
      lucideAudioWaveform,
      lucideBookOpen,
      lucideBot,
      lucideCommand,
      lucideFrame,
      lucideGalleryVerticalEnd,
      lucideChartPie,
      lucideSettings2,
      lucideChevronLeft,
      lucideChevronRight,
    }),
  ],
  templateUrl: "./app-sidebar.component.html",
  styleUrl: "./app-sidebar.component.css",
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger("sidebarCollapse", [
      state(
        "expanded",
        style({
          width: "16rem",
          minWidth: "16rem",
          maxWidth: "16rem",
          transform: "translateX(0)",
        })
      ),
      state(
        "collapsed",
        style({
          width: "4rem",
          minWidth: "4rem",
          maxWidth: "4rem",
          transform: "translateX(0)",
        })
      ),
      transition("expanded => collapsed", [
        animate("250ms cubic-bezier(0.4, 0.0, 0.2, 1)"),
      ]),
      transition("collapsed => expanded", [
        animate("300ms cubic-bezier(0.4, 0.0, 0.2, 1)"),
      ]),
    ]),
    trigger("contentFade", [
      state(
        "visible",
        style({
          opacity: 1,
          transform: "scale(1) translateX(0)",
          visibility: "visible",
        })
      ),
      state(
        "hidden",
        style({
          opacity: 1,
          transform: "scale(1) translateX(0)",
          visibility: "visible",
        })
      ),
      transition("visible => hidden", [animate("150ms cubic-bezier(0.4, 0.0, 1, 1)")]),
      transition("hidden => visible", [
        animate("200ms 100ms cubic-bezier(0.0, 0.0, 0.2, 1)"),
      ]),
    ]),
  ],
})
export class AppSidebarComponent {
  protected readonly isCollapsed = signal(false);

  protected readonly teams: Team[] = [
    {
      name: "Acme Inc",
      logo: "lucideGalleryVerticalEnd",
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: "lucideAudioWaveform",
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: "lucideCommand",
      plan: "Free",
    },
  ];

  protected readonly user: User = {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  };

  protected readonly navMain: MenuItem[] = [
    {
      id: "products",
      title: "Products",
      icon: "lucideBot",
      children: [
        {
          id: "products-list",
          title: "Products List",
          icon: "lucideBot",
          url: "/products",
          shortcut: "p",
        },
        {
          id: "product-categories",
          title: "Product Categories",
          icon: "lucideBot",
          url: "/products/categories",
        },
      ],
    },
    {
      id: "models",
      title: "Models",
      url: "#",
      icon: "lucideBot",
      children: [
        {
          id: "genesis",
          title: "Genesis",
          url: "#",
        },
        {
          id: "explorer",
          title: "Explorer",
          url: "#",
        },
        {
          id: "quantum",
          title: "Quantum",
          url: "#",
        },
      ],
    },
    {
      id: "documentation",
      title: "Documentation",
      url: "#",
      icon: "lucideBookOpen",
      children: [
        {
          id: "introduction",
          title: "Introduction",
          url: "#",
        },
        {
          id: "get-started",
          title: "Get Started",
          url: "#",
        },
        {
          id: "tutorials",
          title: "Tutorials",
          url: "#",
        },
        {
          id: "changelog",
          title: "Changelog",
          url: "#",
        },
      ],
    },
    {
      id: "settings",
      title: "Settings",
      url: "#",
      icon: "lucideSettings2",
      children: [
        {
          id: "general",
          title: "General",
          url: "#",
        },
        {
          id: "team",
          title: "Team",
          url: "#",
        },
        {
          id: "billing",
          title: "Billing",
          url: "#",
        },
        {
          id: "limits",
          title: "Limits",
          url: "#",
        },
      ],
    },
  ];

  protected readonly navOthers: MenuItem[] = [
    {
      id: "integration",
      title: "Integration",
      icon: "lucideSettings2",
      url: "/integrations",
    },
    {
      id: "settings-advanced",
      title: "Settings",
      icon: "lucideSettings2",
      url: "/settings",
      isHideChildren: true,
      isShowSubSidebar: true,
    },
  ];

  protected toggleCollapse(): void {
    this.isCollapsed.update(value => !value);
  }

  protected getSidebarState(): string {
    return this.isCollapsed() ? "collapsed" : "expanded";
  }

  protected getContentState(): string {
    return this.isCollapsed() ? "hidden" : "visible";
  }
}
