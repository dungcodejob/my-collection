import { computed, Injectable, signal } from "@angular/core";
import { SelectFacade } from "./select.facade";
import { SelectOption } from "./select/select";

@Injectable()
export class MCLocalSelectFacade implements SelectFacade {
  private readonly _$searchTerm = signal<string>("");
  private readonly _$options = signal<SelectOption[]>([]);
  private readonly _$isLoading = signal<boolean>(false);
  private readonly _$isOpen = signal<boolean>(false);
  private readonly _$selectedValues = signal<string[]>([]);

  readonly $searchTerm = computed(() => this._$searchTerm());
  readonly $isLoading = computed(() => this._$isLoading());
  readonly $isOpen = computed(() => this._$isOpen());
  readonly $options = computed(() => this._$options());
  readonly $filteredOptions = computed(() => {
    const searchTerm = this._$searchTerm();
    const options = this._$options();
    if (searchTerm) {
      return options.filter(
        option =>
          option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
          option.value.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return options;
  });
  readonly $selectedValues = computed(() => this._$selectedValues());
  readonly $selectedOptions = computed(() => {
    const selectedValues = this._$selectedValues();
    const options = this._$options();
    return options.filter(option => selectedValues.includes(option.value));
  });
  readonly $isAllSelected = computed(() => {
    const selectedValues = this._$selectedValues();
    const options = this._$options();
    return selectedValues.length === options.length;
  });

  search(term: string): void {
    this._$searchTerm.set(term);
  }
  setOpen(isOpen: boolean): void {
    this._$isOpen.set(isOpen);
  }
  select(value: string): void {
    this._$selectedValues.update(values => [...values, value]);
  }
  unselect(value: string): void {
    this._$selectedValues.update(values => values.filter(v => v !== value));
  }
  toggle(value: string): void {
    const currentValues = this._$selectedValues();
    if (currentValues.includes(value)) {
      this.unselect(value);
    } else {
      this.select(value);
    }
  }

  clear(): void {
    this._$selectedValues.set([]);
  }
}
