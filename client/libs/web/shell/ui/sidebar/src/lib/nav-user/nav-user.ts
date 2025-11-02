import { NgOptimizedImage } from "@angular/common";
import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import { NgIconComponent, provideIcons } from "@ng-icons/core";
import {
  lucideChevronsUpDown,
  lucideLogOut,
  lucideSettings,
  lucideUser,
} from "@ng-icons/lucide";
import { HlmButton } from "@spartan-ng/helm/button";
import type { User } from "../sidebar";

@Component({
  selector: "mc-nav-user",
  imports: [NgOptimizedImage, HlmButton, NgIconComponent],
  providers: [
    provideIcons({ lucideChevronsUpDown, lucideLogOut, lucideSettings, lucideUser }),
  ],
  templateUrl: "./nav-user.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MCNavUserComponent {
  readonly user = input.required<User>();
  readonly isCollapsed = input.required<boolean>();
}
