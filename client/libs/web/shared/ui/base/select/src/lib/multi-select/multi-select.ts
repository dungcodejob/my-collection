import { NgTemplateOutlet } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChild,
  effect,
  ElementRef,
  input,
  linkedSignal,
  output,
  signal,
  untracked,
  viewChild,
  ViewEncapsulation,
} from "@angular/core";
import { NgIconComponent, provideIcons } from "@ng-icons/core";
import { lucideCheck, lucideChevronDown, lucideX } from "@ng-icons/lucide";
import { BrnSelectImports } from "@spartan-ng/brain/select";
import { HlmCheckboxImports } from "@spartan-ng/helm/checkbox";
import { HlmSelectImports } from "@spartan-ng/helm/select";
import { BaseSelect } from "../base/base.select";
import { SelectOption } from "../select/select";
import { MCMultiSelectTrigger } from "./multi-select-trigger.directive";

@Component({
  selector: "mc-multi-select",
  imports: [
    BrnSelectImports,
    HlmSelectImports,
    HlmCheckboxImports,
    NgTemplateOutlet,
    NgIconComponent,
  ],
  providers: [provideIcons({ lucideChevronDown, lucideCheck, lucideX })],
  templateUrl: "./multi-select.html",
  styleUrl: "./multi-select.css",
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    "[class.mc-multi-select]": "true",
  },
})
export class MCMultiSelect extends BaseSelect {
  // Inputs
  readonly options = input.required<SelectOption[]>();
  readonly placeholder = input<string>("Select options...");
  readonly disabled = input<boolean>(false);
  readonly value = input<string[]>([]);
  readonly size = input<"sm" | "md" | "lg">("md");
  readonly variant = input<"default" | "outline" | "ghost">("default");
  readonly isSearchable = input<boolean>(false);
  readonly isLoading = input<boolean>(false);
  readonly maxDisplayItems = input<number>(3); // Số items tối đa hiển thị trong trigger
  readonly showSelectAll = input<boolean>(false);
  readonly showClearAll = input<boolean>(false);

  // Outputs
  readonly valueChange = output<string[]>();
  readonly selectionChange = output<SelectOption[]>();
  readonly scrollEnd = output<void>();

  // Internal state
  readonly $selectedValues = signal<string[]>([]);
  readonly $searchTerm = signal<string>("");
  readonly $isOpen = signal<boolean>(false);
  readonly $focusedIndex = signal<number>(-1);
  readonly $isSearchFocused = signal<boolean>(false);

  // Template references
  readonly $searchInput = viewChild<ElementRef<HTMLInputElement>>("searchInput");
  readonly $selectTrigger = viewChild<ElementRef<HTMLElement>>("selectTrigger");
  readonly $selectContent = viewChild<ElementRef<HTMLElement>>("selectContent");

  // Content projection
  readonly $mcMultiSelectTrigger = contentChild(MCMultiSelectTrigger);

  // Computed properties
  protected readonly $filteredOptions = linkedSignal(() => this.options());

  protected readonly $isLoading = linkedSignal(() => this.isLoading());

  readonly $selectedOptions = computed(() => {
    const selectedValues = this.$selectedValues();
    return this.options().filter(option => selectedValues.includes(option.value));
  });

  readonly $selectedValuesSet = computed(() => {
    return new Set(this.$selectedValues());
  });

  readonly $displayText = computed(() => {
    const selectedCount = this.$selectedValues().length;
    if (selectedCount === 0) {
      return this.placeholder();
    }
    if (selectedCount === 1) {
      const option = this.$selectedOptions()[0];
      return option ? option.label : this.placeholder();
    }
    return `${selectedCount} selected`;
  });

  readonly $displayItems = computed(() => {
    const selectedOptions = this.$selectedOptions();
    const maxItems = this.maxDisplayItems();
    return selectedOptions.slice(0, maxItems);
  });

  readonly $hasMoreItems = computed(() => {
    return this.$selectedValues().length > this.maxDisplayItems();
  });

  readonly $selectClasses = computed(() => {
    const baseClasses = "inline-block";
    const sizeClasses = {
      sm: "h-8 text-sm",
      md: "h-10 text-sm",
      lg: "h-12 text-base",
    };
    return `${baseClasses} ${sizeClasses[this.size()]}`;
  });

  readonly $isAllSelected = computed(() => {
    const filteredOptions = this.$filteredOptions();
    const selectedSet = this.$selectedValuesSet();
    return (
      filteredOptions.length > 0 &&
      filteredOptions.every(option => !option.disabled && selectedSet.has(option.value))
    );
  });

  readonly $hasSelectedItems = computed(() => {
    return this.$selectedValues().length > 0;
  });

  constructor() {
    super();
    effect(() => {
      const inputValue = this.value();

      untracked(() => {
        if (inputValue && inputValue.length !== this.$selectedValues().length) {
          this.$selectedValues.set([...inputValue]);
        }
      });
    });

    this._manualSearch();
  }

  onValueToggle(value: string): void {
    const currentValues = this.$selectedValues();
    const selectedSet = new Set(currentValues);

    if (selectedSet.has(value)) {
      selectedSet.delete(value);
    } else {
      selectedSet.add(value);
    }

    const newValues = Array.from(selectedSet);
    this.$selectedValues.set(newValues);
    this.valueChange.emit(newValues);

    const selectedOptions = this.options().filter(option =>
      newValues.includes(option.value)
    );
    this.selectionChange.emit(selectedOptions);
  }

  onSelectAll(): void {
    const filteredOptions = this.$filteredOptions();
    const enabledOptions = filteredOptions.filter(option => !option.disabled);
    const newValues = enabledOptions.map(option => option.value);
    this.$selectedValues.set(newValues);
    this.valueChange.emit(newValues);
    this.selectionChange.emit(enabledOptions);
  }

  onClearAll(): void {
    this.$selectedValues.set([]);
    this.valueChange.emit([]);
    this.selectionChange.emit([]);
  }

  onRemoveItem(value: string, event: Event): void {
    event.stopPropagation();
    const currentValues = this.$selectedValues();
    const newValues = currentValues.filter(v => v !== value);
    this.$selectedValues.set(newValues);
    this.valueChange.emit(newValues);

    const selectedOptions = this.options().filter(option =>
      newValues.includes(option.value)
    );
    this.selectionChange.emit(selectedOptions);
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
        this._toggleFocusedOption(filteredOptions);
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
          this.onValueToggle(filteredOptions[0].value);
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

  isSelected(value: string): boolean {
    return this.$selectedValuesSet().has(value);
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
      } else {
        untracked(() => {
          this.$filteredOptions.set(this.options());
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

  private _toggleFocusedOption(filteredOptions: SelectOption[]): void {
    const focusedIndex = this.$focusedIndex();
    if (focusedIndex >= 0 && focusedIndex < filteredOptions.length) {
      const option = filteredOptions[focusedIndex];
      if (!option.disabled) {
        this.onValueToggle(option.value);
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
