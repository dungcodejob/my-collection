import { NgTemplateOutlet } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChild,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  input,
  linkedSignal,
  OnInit,
  output,
  signal,
  untracked,
  viewChild,
  ViewEncapsulation,
} from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { injectAutoEffect } from "@client/web-shared-utils";
import { provideIcons } from "@ng-icons/core";
import { lucideCheck, lucideChevronDown } from "@ng-icons/lucide";
import { BrnSelectImports } from "@spartan-ng/brain/select";
import { HlmSelectImports } from "@spartan-ng/helm/select";
import { debounceTime, distinctUntilChanged, fromEvent, map, tap } from "rxjs";
import { MCLocalSelectFacade } from "../local-select.facade";
import { injectSelectFacade, provideSelectFacade } from "../select.facade";
import { MCSelectTrigger } from "./select-trigger.directive";
export type SelectOption<T = string> = {
  value: T;
  label: string;
  disabled?: boolean;
};

@Component({
  selector: "mc-select",
  imports: [BrnSelectImports, HlmSelectImports, NgTemplateOutlet],
  providers: [
    provideIcons({ lucideChevronDown, lucideCheck }),
    provideSelectFacade(MCLocalSelectFacade),
  ],
  templateUrl: "./select.html",
  styleUrl: "./select.css",
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    "[class.mc-select]": "true",
  },
})
export class MCSelect implements OnInit {
  // readonly selectApi = inject(MCApiSelectFacade, { optional: true });
  protected readonly facade = injectSelectFacade();
  private readonly _autoEffect = injectAutoEffect();
  private readonly _destroyRef = inject(DestroyRef);

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
  readonly valueChange = output<string | undefined>();
  readonly valueOptionChange = output<SelectOption | undefined>();
  readonly scrollEnd = output<void>();

  // Internal state

  readonly $selectedValue = computed(() => {
    const value = this.facade.$selectedValues();
    return value.length > 0 ? value[0] : null;
  });

  readonly $selectedOption = computed(() => {
    const options = this.facade.$selectedOptions();
    return options.length > 0 ? options[0] : null;
  });

  readonly $focusedIndex = signal<number>(-1);
  readonly $isSearchFocused = signal<boolean>(false);

  // Template references
  readonly $searchInput = viewChild<ElementRef<HTMLInputElement>>("searchInput");
  readonly $selectTrigger = viewChild<ElementRef<HTMLElement>>("selectTrigger");
  readonly $selectContent = viewChild<ElementRef<HTMLElement>>("selectContent");

  // Content projection
  readonly $mcSelectTrigger = contentChild(MCSelectTrigger);

  // Computed properties

  protected readonly $isLoading = linkedSignal(() => this.isLoading());

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
    // effect(() => {
    //   const inputValue = this.value();
    //   if (inputValue !== null && inputValue !== this.$selectedValue()) {
    //     this.$selectedValue.set(inputValue);
    //   }
    // });
    // if (this.selectApi) {
    //   effect(() => {
    //     this.selectApi?.setOpen(this.$isOpen());
    //     this.selectApi?.setSearchTerm(this.$searchTerm());
    //   });
    //   this.selectApi.connectIsLoading(this.$isLoading);
    // } else {
    //   this.facade.search(this.$searchTerm());
    // }
  }

  ngOnInit(): void {
    this.searchChangeEffect();
    this.valueChangeEffect();
  }

  onSelect(value?: any): void {
    if (value) {
      this.facade.select(value);
    }

    this.valueChange.emit(value);
    this.facade.search(""); // Clear search when option is selected
  }

  onSearchChange(event: Event): void {}

  onScrollEnd(): void {
    this.scrollEnd.emit();
    // this.facade.nextPage();
  }

  clearSearch(): void {
    this.facade.search("");
    this.$focusedIndex.set(-1);
    this._focusSearchInput();
  }

  onSelectOpen(): void {
    this.facade.setOpen(true);
    this.$focusedIndex.set(-1);
    if (this.isSearchable()) {
      setTimeout(() => this._focusSearchInput(), 0);
    }
  }

  onSelectClose(): void {
    this.facade.setOpen(false);
    this.$focusedIndex.set(-1);
    this.$isSearchFocused.set(false);
    this.clearSearch();
  }

  onKeyDown(event: KeyboardEvent): void {
    if (!this.facade.$isOpen()) return;

    const filteredOptions = this.facade.$filteredOptions();

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
    const filteredOptions = this.facade.$filteredOptions();

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
          this.onSelect(filteredOptions[0].value);
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

  searchChangeEffect(): void {
    const searchInput = this.$searchInput();

    if (searchInput) {
      fromEvent(searchInput.nativeElement, "input")
        .pipe(
          map(event => (event.target as HTMLInputElement).value),
          distinctUntilChanged(),
          debounceTime(100),
          tap(searchTerm => {
            this.facade.search(searchTerm);
            this.$focusedIndex.set(-1);
          }),
          takeUntilDestroyed(this._destroyRef)
        )
        .subscribe();
    }
  }

  valueChangeEffect(): void {
    this._autoEffect(() => {
      const selectedValue = this.$selectedValue();

      untracked(() => {
        this.facade.search("");
        this.valueChange.emit(selectedValue ?? undefined);
      });
    });

    effect(() => {
      const selectedOption = this.$selectedOption();
      untracked(() => {
        this.valueOptionChange.emit(selectedOption ?? undefined);
      });
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
        this.onSelect(option.value);
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
