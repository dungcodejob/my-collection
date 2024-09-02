import { DatePipe } from "@angular/common";
import { Component, input, output } from "@angular/core";
import { BookmarkVisibility } from "@bookmark/data-access";
import { lucideTrash2 } from "@ng-icons/lucide";
import { BookmarkVM } from "@shared/models";
import { HlmButtonDirective } from "@spartan-ng/ui-button-helm";
import { HlmCardDirective } from "@spartan-ng/ui-card-helm";
import { HlmIconComponent, provideIcons } from "@spartan-ng/ui-icon-helm";
import { HlmMutedDirective, HlmSmallDirective } from "@spartan-ng/ui-typography-helm";
import { BookmarkItemComponent } from "../bookmark-item/bookmark-item.component";
import { BookmarkSkeletonComponent } from "../bookmark-skeleton/bookmark-skeleton.component";

type BookmarkId = BookmarkVM["id"];
const lucideEdit = `<svg xmlns="http://www.w3.org/2000/svg"  viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-pencil"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>`;
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

    BookmarkSkeletonComponent,
    BookmarkItemComponent,
  ],
  providers: [
    provideIcons({
      lucideTrash2,
      lucideEdit,
    }),
  ],
  templateUrl: "./bookmark-list.component.html",
  styleUrl: "./bookmark-list.component.scss",
})
export class BookmarkListComponent {
  $items = input.required<BookmarkVM[]>({ alias: "items" });
  $visibility = input.required<BookmarkVisibility>({ alias: "visibility" });

  onSelected = output<BookmarkId>();
  onEdit = output<BookmarkId>();
  onDelete = output<BookmarkId>();
}
