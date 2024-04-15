import { DatePipe } from "@angular/common";
import { Component, input } from "@angular/core";
import { BookmarkVM } from "@shared/models";
import { HlmButtonDirective } from "@spartan-ng/ui-button-helm";
import { HlmCardDirective } from "@spartan-ng/ui-card-helm";

@Component({
  selector: "app-bookmark-item",
  standalone: true,
  imports: [DatePipe, HlmCardDirective, HlmButtonDirective],
  templateUrl: "./bookmark-item.component.html",
  styleUrl: "./bookmark-item.component.scss",
})
export class BookmarkItemComponent {
  $data = input.required<BookmarkVM>({ alias: "data" });
}
