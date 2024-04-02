import { Component } from "@angular/core";
import { provideIcons } from "@ng-icons/core";
import { lucideFolder } from "@ng-icons/lucide";
import { HlmButtonDirective } from "@spartan-ng/ui-button-helm";
import { HlmIconComponent } from "@spartan-ng/ui-icon-helm";

@Component({
  selector: "app-bookmark-management",
  standalone: true,
  imports: [HlmButtonDirective, HlmIconComponent],
  templateUrl: "./bookmark-management.component.html",
  styleUrl: "./bookmark-management.component.scss",
  providers: [
    provideIcons({
      lucideFolder,
    }),
  ],
})
export class BookmarkManagementComponent {}
