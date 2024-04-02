import { Component } from "@angular/core";
import { lucideBell, lucideInbox, lucideSettings } from "@ng-icons/lucide";
import { HlmButtonDirective } from "@spartan-ng/ui-button-helm";
import { HlmIconComponent, provideIcons } from "@spartan-ng/ui-icon-helm";

@Component({
  selector: "app-sidebar",
  standalone: true,
  imports: [HlmButtonDirective, HlmIconComponent],
  providers: [
    provideIcons({
      lucideInbox,
      lucideBell,
      lucideSettings,
    }),
  ],
  templateUrl: "./sidebar.component.html",
  styleUrl: "./sidebar.component.scss",
})
export class SidebarComponent {}
