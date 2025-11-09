import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  input,
  linkedSignal,
  model,
  output,
  signal,
  untracked,
  viewChild,
  ViewEncapsulation,
} from "@angular/core";
import { provideIcons } from "@ng-icons/core";
import { lucideCheck, lucideChevronDown } from "@ng-icons/lucide";
import { BrnSelectImports } from "@spartan-ng/brain/select";
import { HlmSelectImports } from "@spartan-ng/helm/select";
import { MCSelectApiDirective } from "./select-api.directive";

export type SelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

@Component({
  selector: "mc-select",
  imports: [BrnSelectImports, HlmSelectImports],
  providers: [provideIcons({ lucideChevronDown, lucideCheck })],
  templateUrl: "./select.html",
  styleUrl: "./select.css",
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class MCSelectComponent {
  readonly selectApi = inject(MCSelectApiDirective, { optional: true });

  // Inputs
  readonly options = input.required<SelectOption[]>();
  readonly placeholder = input<string>("Select an option...");
  readonly disabled = input<boolean>(false);
  readonly value = input<string | null>(null);
  readonly size = input<"sm" | "md" | "lg">("md");
  readonly variant = input<"default" | "outline" | "ghost">("default");
  readonly isSearchable = input<boolean>(false);
  readonly isLoading = input<boolean>(false);
  // Outputs
  readonly valueChange = output<string>();
  readonly selectionChange = output<SelectOption>();
  readonly scrollEnd = output<void>();

  // Internal state
  readonly $selectedValue = model<string | null>(null);
  readonly $searchTerm = signal<string>("");
  readonly $isOpen = signal<boolean>(false);
  readonly $focusedIndex = signal<number>(-1);
  readonly $isSearchFocused = signal<boolean>(false);

  // Template references
  readonly $searchInput = viewChild<ElementRef<HTMLInputElement>>("searchInput");
  readonly $selectTrigger = viewChild<ElementRef<HTMLElement>>("selectTrigger");
  readonly $selectContent = viewChild<ElementRef<HTMLElement>>("selectContent");

  // Computed properties
  protected readonly $filteredOptions = linkedSignal(() => this.options());

  protected readonly $isLoading = linkedSignal(() => this.isLoading());

  readonly $selectedOption = computed(() => {
    const currentValue = this.$selectedValue() || this.value();
    return this.options().find(option => option.value === currentValue) || null;
  });

  readonly $displayText = computed(() => {
    const selected = this.$selectedOption();
    return selected ? selected.label : this.placeholder();
  });

  readonly $selectClasses = computed(() => {
    const baseClasses = "w-full";
    const sizeClasses = {
      sm: "h-8 text-sm",
      md: "h-10 text-sm",
      lg: "h-12 text-base",
    };
    return `${baseClasses} ${sizeClasses[this.size()]}`;
  });

  constructor() {
    // Initialize selected value from input
    effect(() => {
      const inputValue = this.value();
      if (inputValue !== null && inputValue !== this.$selectedValue()) {
        this.$selectedValue.set(inputValue);
      }
    });

    if (this.selectApi) {
      effect(() => {
        this.selectApi?.setOpen(this.$isOpen());
        this.selectApi?.setSearchTerm(this.$searchTerm());
      });

      this.selectApi.connectIsLoading(this.$isLoading);
      this.selectApi.connectOptions(this.$filteredOptions);
    } else {
      this._manualSearch();
    }
  }

  onValueChange(value: string): void {
    this.$selectedValue.set(value);
    this.valueChange.emit(value);
    this.$searchTerm.set(""); // Clear search when option is selected

    const selectedOption = this.options().find(option => option.value === value);
    if (selectedOption) {
      this.selectionChange.emit(selectedOption);
    }
  }

  onSearchChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    const searchTerm = target.value;
    const previousSearchTerm = this.$searchTerm();
    this.$searchTerm.set(searchTerm);
    // Only reset focused index if search term actually changed
    if (searchTerm !== previousSearchTerm) {
      this.$focusedIndex.set(-1);
    }
  }

  onScrollEnd(): void {
    this.scrollEnd.emit();
    this.selectApi?.nextPage();
  }

  clearSearch(): void {
    this.$searchTerm.set("");
    this.$focusedIndex.set(-1);
    this._focusSearchInput();
  }

  onSelectOpen(): void {
    this.$isOpen.set(true);
    this.$focusedIndex.set(-1);
    if (this.isSearchable()) {
      setTimeout(() => this._focusSearchInput(), 0);
    }
  }

  onSelectClose(): void {
    this.$isOpen.set(false);
    this.$focusedIndex.set(-1);
    this.$isSearchFocused.set(false);
    this.clearSearch();
  }

  onKeyDown(event: KeyboardEvent): void {
    if (!this.$isOpen()) return;

    const filteredOptions = this.$filteredOptions();
    const currentIndex = this.$focusedIndex();

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        this._navigateDown(filteredOptions.length);
        break;
      case "ArrowUp":
        event.preventDefault();
        this._navigateUp(filteredOptions.length);
        break;
      case "Enter":
        event.preventDefault();
        this._selectFocusedOption(filteredOptions);
        break;
      case "Escape":
        event.preventDefault();
        this._closeSelect();
        break;
      case "Home":
        event.preventDefault();
        this.$focusedIndex.set(0);
        break;
      case "End":
        event.preventDefault();
        this.$focusedIndex.set(filteredOptions.length - 1);
        break;
    }
  }

  onSearchKeyDown(event: KeyboardEvent): void {
    event.stopPropagation();
    const filteredOptions = this.$filteredOptions();

    switch (event.key) {
      // case "ArrowDown":
      //   event.preventDefault();
      //   this.$isSearchFocused.set(false);
      //   this.$focusedIndex.set(0);
      //   break;
      // case "ArrowUp":
      //   event.preventDefault();
      //   this.$isSearchFocused.set(false);
      //   this.$focusedIndex.set(filteredOptions.length - 1);
      //   break;
      case "ArrowDown":
        event.preventDefault();
        this._navigateDown(filteredOptions.length);
        break;
      case "ArrowUp":
        event.preventDefault();
        this._navigateUp(filteredOptions.length);
        break;
      case "Enter":
        event.preventDefault();
        if (filteredOptions.length > 0) {
          this.onValueChange(filteredOptions[0].value);
        }
        break;
      case "Escape":
        event.preventDefault();
        this._closeSelect();
        break;
    }
  }

  onSearchFocus(): void {
    this.$isSearchFocused.set(true);
    this.$focusedIndex.set(-1);
  }

  onOptionHover(index: number): void {
    this.$focusedIndex.set(index);
    this.$isSearchFocused.set(false);
  }

  trackByValue(index: number, option: SelectOption): string {
    return option.value;
  }

  private _manualSearch(): void {
    effect(() => {
      const searchTerm = this.$searchTerm().toLowerCase().trim();
      if (searchTerm && this.isSearchable()) {
        const filteredOptions = this.options().filter(
          option =>
            option.label.toLowerCase().includes(searchTerm) ||
            option.value.toLowerCase().includes(searchTerm)
        );

        untracked(() => {
          this.$filteredOptions.set(filteredOptions);
        });
      }
    });
  }

  // Private methods
  private _navigateDown(optionsLength: number): void {
    const currentIndex = this.$focusedIndex();

    const nextIndex = currentIndex < optionsLength - 1 ? currentIndex + 1 : 0;
    this.$focusedIndex.set(nextIndex);
  }

  private _navigateUp(optionsLength: number): void {
    const currentIndex = this.$focusedIndex();
    if (this.$isSearchFocused()) {
      this.$isSearchFocused.set(false);
      this.$focusedIndex.set(optionsLength - 1);
    } else {
      const prevIndex = currentIndex > 0 ? currentIndex - 1 : optionsLength - 1;
      this.$focusedIndex.set(prevIndex);
    }
  }

  private _selectFocusedOption(filteredOptions: SelectOption[]): void {
    const focusedIndex = this.$focusedIndex();
    if (focusedIndex >= 0 && focusedIndex < filteredOptions.length) {
      const option = filteredOptions[focusedIndex];
      if (!option.disabled) {
        this.onValueChange(option.value);
      }
    }
  }

  private _closeSelect(): void {
    this.onSelectClose();
    this.$selectTrigger()?.nativeElement?.focus();
  }

  private _focusSearchInput(): void {
    setTimeout(() => {
      this.$searchInput()?.nativeElement?.focus();
    }, 0);
  }
}
