import {
  ChangeDetectionStrategy,
  Component,
  input,
  signal,
} from "@angular/core";
import { NgIconComponent, provideIcons } from "@ng-icons/core";
import { lucideChevronDown, lucideBuilding, lucidePlus } from "@ng-icons/lucide";
import { HlmAvatarComponent, HlmAvatarImageDirective, HlmAvatarFallbackDirective } from "@spartan-ng/helm/avatar";
import { HlmButtonDirective } from "@spartan-ng/helm/button";
import { HlmMenuComponent, HlmMenuItemDirective, HlmMenuLabelComponent, HlmMenuSeparatorComponent, HlmMenuItemIconDirective } from "@spartan-ng/helm/menu";
import { HlmTooltipComponent, HlmTooltipTriggerDirective } from "@spartan-ng/helm/tooltip";
import { BrnMenuTriggerDirective } from "@spartan-ng/brain/menu";
import { BrnTooltipContentDirective } from "@spartan-ng/brain/tooltip";

export type Team = {
  name: string;
  logo: string;
  plan: string;
};

@Component({
  selector: "mc-team-switcher",
  imports: [
    HlmButtonDirective,
    HlmAvatarComponent,
    HlmAvatarImageDirective,
    HlmAvatarFallbackDirective,
    HlmMenuComponent,
    HlmMenuItemDirective,
    HlmMenuLabelComponent,
    HlmMenuSeparatorComponent,
    HlmMenuItemIconDirective,
    HlmTooltipComponent,
    HlmTooltipTriggerDirective,
    BrnMenuTriggerDirective,
    BrnTooltipContentDirective,
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
            <hlm-avatar class="size-4">
              <img hlmAvatarImage [alt]="activeTeam().name" [src]="activeTeam().logo" />
              <span hlmAvatarFallback>{{ activeTeam().name.charAt(0) }}</span>
            </hlm-avatar>
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
          hlmBtn
          size="sm"
          type="button"
          variant="ghost"
          [brnMenuTriggerFor]="menu"
        >
          <ng-icon
            class="transition-transform group-data-[state=open]:rotate-180"
            name="lucideChevronDown"
            size="12"
          />
        </button>

        <ng-template #menu>
          <hlm-menu class="w-56">
            <hlm-menu-label>Switch Team</hlm-menu-label>
            @for (team of teams(); track team.name) {
              <button hlmMenuItem (click)="switchTeam(team)">
                <ng-icon hlmMenuItemIcon name="lucideBuilding" size="16" />
                {{ team.name }}
              </button>
            }
            <hlm-menu-separator />
            <button hlmMenuItem (click)="addTeam()">
              <ng-icon hlmMenuItemIcon name="lucidePlus" size="16" />
              Add Team
            </button>
          </hlm-menu>
        </ng-template>
      } @else {
        <div class="flex size-8 items-center justify-center rounded-sm">
          <div
            class="flex aspect-square size-5 items-center justify-center rounded-sm bg-sidebar-primary text-sidebar-primary-foreground"
          >
            <hlm-tooltip>
              <hlm-avatar class="size-4" hlmTooltipTrigger>
                <img hlmAvatarImage [alt]="activeTeam().name" [src]="activeTeam().logo" />
                <span hlmAvatarFallback>{{ activeTeam().name.charAt(0) }}</span>
              </hlm-avatar>
              <span *brnTooltipContent>{{ activeTeam().name }}</span>
            </hlm-tooltip>
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

  protected switchTeam(team: Team): void {
    this.activeTeam.set(team);
    console.log("Switched to team:", team.name);
  }

  protected addTeam(): void {
    console.log("Add new team");
  }
}
