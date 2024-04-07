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
import { BookmarkFacade } from "./bookmark-list.facade";

// Generics
export function coerceArray<T>(value: T | T[]): T[];
export function coerceArray<T>(value: T | readonly T[]): readonly T[];
export function coerceArray<T>(value: T | T[]): T[] {
  return Array.isArray(value) ? value : [value];
}

@Component({
  selector: "app-bookmark-list",
  templateUrl: "./bookmark-list.component.html",
  styleUrls: ["./bookmark-list.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [NgIf, NgFor, NgTemplateOutlet],
  providers: [BookmarkFacade],
})
export class BookmarkListComponent implements OnInit {
  private readonly _injector = inject(Injector);
  private readonly _facade = inject(BookmarkFacade);
  private readonly _route = inject(ActivatedRoute);
  $collectionId = input.required<string>({ alias: "collectionId" });
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
