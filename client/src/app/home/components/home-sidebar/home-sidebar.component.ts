import { Component } from "@angular/core";
import { lucideBell, lucideInbox, lucideSettings } from "@ng-icons/lucide";
import { HlmButtonDirective } from "@spartan-ng/ui-button-helm";
import { HlmIconComponent, provideIcons } from "@spartan-ng/ui-icon-helm";
import { HlmSmallDirective } from "@spartan-ng/ui-typography-helm";

@Component({
  selector: "app-home-sidebar",
  standalone: true,
  imports: [HlmSmallDirective, HlmButtonDirective, HlmIconComponent],
  providers: [
    provideIcons({
      lucideInbox,
      lucideBell,
      lucideSettings,
    }),
  ],
  templateUrl: "./home-sidebar.component.html",
  styleUrl: "./home-sidebar.component.scss",
})
export class HomeSidebarComponent {}
