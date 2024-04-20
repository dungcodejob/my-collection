import {
  Component,
  ElementRef,
  ViewChild,
  computed,
  forwardRef,
  input,
  output,
  signal,
} from "@angular/core";
import { outputFromObservable } from "@angular/core/rxjs-interop";
import {
  ControlValueAccessor,
  FormControl,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
} from "@angular/forms";
import { lucideCheck, lucideChevronsUpDown, lucideSearch } from "@ng-icons/lucide";
import { TagVM } from "@shared/models";
import { HlmBadgeDirective } from "@spartan-ng/ui-badge-helm";
import { HlmButtonDirective } from "@spartan-ng/ui-button-helm";
import { HlmIconComponent, provideIcons } from "@spartan-ng/ui-icon-helm";
import { HlmInputDirective } from "@spartan-ng/ui-input-helm";
import { BrnSelectComponent, BrnSelectImports } from "@spartan-ng/ui-select-brain";
import { HlmSelectImports } from "@spartan-ng/ui-select-helm";
import { HlmMutedDirective } from "@spartan-ng/ui-typography-helm";
import { asapScheduler, startWith } from "rxjs";

type ChangeFn = (value: TagVM[]) => void;
type TouchedFn = () => void;
@Component({
  selector: "app-bookmark-tag-select",
  standalone: true,
  imports: [
    ReactiveFormsModule,
    HlmIconComponent,
    HlmButtonDirective,
    HlmInputDirective,
    HlmBadgeDirective,
    HlmMutedDirective,
    BrnSelectImports,
    HlmSelectImports,
  ],
  providers: [
    provideIcons({ lucideChevronsUpDown, lucideSearch, lucideCheck }),
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => BookmarkTagSelectComponent),
      multi: true,
    },
  ],
  host: {
    class: "block",
  },
  templateUrl: "./bookmark-tag-select.component.html",
  styleUrl: "./bookmark-tag-select.component.scss",
})
export class BookmarkTagSelectComponent implements ControlValueAccessor {
  @ViewChild("tagSearchInput") input!: ElementRef<HTMLInputElement>;
  @ViewChild("select") select!: BrnSelectComponent;
  $selected = signal<TagVM[]>([]);

  keywordControl = new FormControl<string>("", { nonNullable: true });

  originOptions = input<TagVM[]>([], { alias: "options" });
  onSearch = outputFromObservable(
    this.keywordControl.valueChanges.pipe(startWith(this.keywordControl.getRawValue()))
  );
  onCreate = output<string>();

  $displayOptions = computed(() => {
    const options = this.originOptions();
    const selectedIds = this.$selected().map(item => item.id);

    return options.filter(item => !selectedIds.includes(item.id));
  });

  private _onChange!: ChangeFn;
  private _onTouched!: TouchedFn;
  writeValue(obj: TagVM[] | null): void {
    this.$selected.set(obj ?? []);
  }
  registerOnChange(fn: ChangeFn): void {
    this._onChange = fn;
  }
  registerOnTouched(fn: TouchedFn): void {
    this._onTouched = fn;
  }
  setDisabledState?(isDisabled: boolean): void {
    // throw new Error("Method not implemented.");
    console.log("Method not implemented");
  }

  onOptionSelected(tag: TagVM): void {
    const value = [...this.$selected(), tag];
    this.$selected.set(value);
    this._onChange(value);
    this._onTouched();
  }

  onTagCreate(): void {
    this.onCreate.emit(this.keywordControl.value);
    this.keywordControl.setValue("");
    this.select.close();
  }

  onOpenChange(open: boolean) {
    if (open) {
      asapScheduler.schedule(() => this.input.nativeElement.focus(), 100);
    }
  }
}
