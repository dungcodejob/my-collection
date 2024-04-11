import { DatePipe } from "@angular/common";
import { Component, input, output } from "@angular/core";
import { lucideTrash2 } from "@ng-icons/lucide";
import { BookmarkVM } from "@shared/models";
import { HlmButtonDirective } from "@spartan-ng/ui-button-helm";
import { HlmCardDirective } from "@spartan-ng/ui-card-helm";
import { HlmIconComponent, provideIcons } from "@spartan-ng/ui-icon-helm";
import { HlmMutedDirective, HlmSmallDirective } from "@spartan-ng/ui-typography-helm";

type BookmarkId = BookmarkVM["id"];

@Component({
  selector: "app-bookmark-list",
  standalone: true,
  imports: [
    DatePipe,
    HlmCardDirective,
    HlmButtonDirective,
    HlmIconComponent,
    HlmSmallDirective,
    HlmMutedDirective,
  ],
  providers: [
    provideIcons({
      lucideTrash2,
    }),
  ],
  templateUrl: "./bookmark-list.component.html",
  styleUrl: "./bookmark-list.component.scss",
})
export class BookmarkListComponent {
  $items = input.required<BookmarkVM[]>({ alias: "items" });

  selected = output<BookmarkId>();
  delete = output<BookmarkId>();
}
