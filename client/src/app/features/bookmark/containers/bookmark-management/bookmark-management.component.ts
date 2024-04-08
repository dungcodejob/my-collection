import { NgFor, NgIf, NgTemplateOutlet } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  Injector,
  OnInit,
  effect,
  inject,
  input,
  untracked,
} from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { HlmButtonDirective } from "@spartan-ng/ui-button-helm";
import { HlmIconComponent, provideIcons } from "@spartan-ng/ui-icon-helm";
import { BookmarkFacade } from "./bookmark-management.facade";

// Generics
export function coerceArray<T>(value: T | T[]): T[];
export function coerceArray<T>(value: T | readonly T[]): readonly T[];
export function coerceArray<T>(value: T | T[]): T[] {
  return Array.isArray(value) ? value : [value];
}

const lucideCirclePlus = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-circle-plus"><circle cx="12" cy="12" r="10"/><path d="M8 12h8"/><path d="M12 8v8"/></svg>`;

@Component({
  templateUrl: "./bookmark-management.component.html",
  styleUrls: ["./bookmark-management.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [NgIf, NgFor, NgTemplateOutlet, HlmIconComponent, HlmButtonDirective],
  providers: [
    BookmarkFacade,
    provideIcons({
      lucideCirclePlus,
    }),
  ],
})
export class BookmarkManagementComponent implements OnInit {
  private readonly _injector = inject(Injector);
  private readonly _facade = inject(BookmarkFacade);
  private readonly _route = inject(ActivatedRoute);
  $collectionId = input.required<string>({ alias: "collectionId" });
  $collectionTitle = this._facade.$collectionTitle;
  // items = input.required({
  //   transform: coerceArray<BookmarkDto>,
  // });
  // loading = input(false);
  // @Input() error: string | null = null;
  // @Input() isNext = false;
  // @Input() isPrev = false;
  // @Output() next = new EventEmitter<void>();
  // @Output() edit = new EventEmitter<string>();
  // @Output() prev = new EventEmitter<void>();

  ngOnInit(): void {
    effect(
      () => {
        const collectionId = this.$collectionId();

        untracked(() => {
          this._facade.load(collectionId);
        });
      },
      { injector: this._injector }
    );
  }
}
