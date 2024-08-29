import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from "@angular/core";
import { PaginationVM } from "@shared/data-access/pagination/pagination-name.type";
import {
  HlmPaginationContentDirective,
  HlmPaginationDirective,
  HlmPaginationEllipsisComponent,
  HlmPaginationItemDirective,
  HlmPaginationLinkDirective,
  HlmPaginationNextComponent,
  HlmPaginationPreviousComponent,
} from "@spartan-ng/ui-pagination-helm";

@Component({
  selector: "app-pagination",
  standalone: true,
  imports: [
    HlmPaginationDirective,
    HlmPaginationContentDirective,
    HlmPaginationItemDirective,
    HlmPaginationPreviousComponent,
    HlmPaginationNextComponent,
    HlmPaginationLinkDirective,
    HlmPaginationEllipsisComponent,
  ],
  templateUrl: "./pagination.component.html",
  styleUrl: "./pagination.component.css",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaginationComponent {
  $pagination = input.required<PaginationVM>({ alias: "pagination" });
  $maxItemDisplay = input(5, { alias: "maxItemDisplay" });

  $totalPages = computed(() => this.$pagination().totalPages);
  $pageSize = computed(() => this.$pagination().pageSize);
  $currentPage = computed(() => this.$pagination().currentPage);
  $hasPrevious = computed(() => this.$pagination().hasPrevious);
  $hasNext = computed(() => this.$pagination().hasNext);

  $pages = computed(() => {
    const totalPages = this.$totalPages();
    const currentPage = this.$currentPage();
    const maxItemDisplay = this.$maxItemDisplay();
    let startPage = Math.max(1, currentPage - (maxItemDisplay - 1) / 2);
    let endPage = Math.min(totalPages, currentPage + (maxItemDisplay - 1) / 2);

    if (currentPage <= (maxItemDisplay + 1) / 2) {
      startPage = 1;
      endPage = Math.min(5, totalPages);
    }

    if (currentPage > totalPages - (maxItemDisplay + 1) / 2) {
      startPage = Math.max(1, totalPages - (maxItemDisplay - 1));
      endPage = totalPages;
    }

    console.log(startPage, endPage);

    return Array.from({ length: endPage - startPage + 1 }, (_, i) => i + startPage);
  });

  next = output();
  previous = output();

  onNext() {
    this.next.emit();
  }

  onPrevious() {
    this.previous.emit();
  }
}
