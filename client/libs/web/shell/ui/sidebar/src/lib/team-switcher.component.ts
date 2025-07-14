import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  signal,
} from "@angular/core";
import { MenuItem } from "primeng/api";
import { AvatarModule } from "primeng/avatar";
import { ButtonModule } from "primeng/button";
import { DropdownModule } from "primeng/dropdown";
import { MenuModule } from "primeng/menu";
import { TooltipModule } from "primeng/tooltip";
import { NgIconComponent, provideIcons } from "@ng-icons/core";
import { lucideChevronDown, lucideBuilding, lucidePlus } from "@ng-icons/lucide";

export type Team = {
  name: string;
  logo: string;
  plan: string;
}

@Component({
  selector: "mc-team-switcher",
  imports: [
    ButtonModule,
    DropdownModule,
    TooltipModule,
    AvatarModule,
    MenuModule,
    NgIconComponent,
  ],
  providers: [provideIcons({ lucideChevronDown, lucideBuilding, lucidePlus })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex items-center gap-1.5 px-2 py-1.5">
      @if (!isCollapsed()) {
        <div class="flex items-center gap-1.5 flex-1 min-w-0">
          <div
            class="flex aspect-square size-5 items-center justify-center rounded-sm bg-sidebar-primary text-sidebar-primary-foreground"
          >
            <p-avatar
              class="size-4"
              shape="square"
              size="normal"
              [image]="activeTeam().logo"
            />
          </div>
          <div class="grid flex-1 text-left text-sm leading-tight">
            <span class="truncate font-semibold text-sidebar-foreground">
              {{ activeTeam().name }}
            </span>
            <span class="truncate text-xs text-sidebar-muted-foreground">
              {{ activeTeam().plan }}
            </span>
          </div>
        </div>

        <button
          class="ml-auto flex size-4 shrink-0 items-center justify-center rounded-sm text-sidebar-muted-foreground outline-none ring-sidebar-ring transition-[margin,opa] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 group-data-[collapsible=icon]:hidden"
          type="button"
          (click)="menu.toggle($event)"
        >
          <ng-icon
            class="transition-transform group-data-[state=open]:rotate-180"
            name="lucideChevronDown"
            size="12"
          />
        </button>

        <p-menu #menu [model]="menuItems()" [popup]="true" />
      } @else {
        <div class="flex size-8 items-center justify-center rounded-sm">
          <div
            class="flex aspect-square size-5 items-center justify-center rounded-sm bg-sidebar-primary text-sidebar-primary-foreground"
          >
            <p-avatar
              class="size-4"
              shape="square"
              size="normal"
              tooltipPosition="right"
              [image]="activeTeam().logo"
              [pTooltip]="activeTeam().name"
            />
          </div>
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
    `,
  ],
})
export class TeamSwitcherComponent {
  readonly teams = input.required<Team[]>();
  readonly isCollapsed = input(false);

  protected readonly activeTeam = signal<Team>({
    name: "Acme Inc",
    logo: "/assets/team-logo.png",
    plan: "Enterprise",
  });

  protected readonly menuItems = computed<MenuItem[]>(() => [
    {
      label: "Switch Team",
      items: this.teams().map(team => ({
        label: team.name,
        template: `<ng-icon name="lucideBuilding" size="16" class="mr-2" />${team.name}`,
        command: () => this.switchTeam(team),
      })),
    },
    {
      separator: true,
    },
    {
      label: "Add Team",
      template: '<ng-icon name="lucidePlus" size="16" class="mr-2" />Add Team',
      command: () => this.addTeam(),
    },
  ]);

  protected switchTeam(team: Team): void {
    this.activeTeam.set(team);
    console.log("Switched to team:", team.name);
  }

  protected addTeam(): void {
    console.log("Add new team");
  }
}
