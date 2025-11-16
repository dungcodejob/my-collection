import {
  ClassProvider,
  computed,
  DestroyRef,
  Directive,
  effect,
  inject,
  Injector,
  input,
  Signal,
  signal,
  Type,
  untracked,
  WritableSignal,
} from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { PAGE_SIZE_DEFAULT } from "@client/web-shared-constants";
import { finalize, Observable, tap } from "rxjs";
import { provideSelectFacade, SelectFacade } from "./select.facade";
import { SelectOption } from "./select/select";

type SelectApiFilter = {
  searchTerm?: string;
  page?: number;
  itemSize?: number;
};

@Directive({
  selector: "[mcSelectApi]",
  standalone: true,
})
export abstract class MCApiSelectFacade<TFilter extends SelectApiFilter = SelectApiFilter>
  implements SelectFacade
{
  protected readonly _destroyRef = inject(DestroyRef);
  protected readonly _injector = inject(Injector);

  readonly $itemSize = input(PAGE_SIZE_DEFAULT.SELECT);

  protected readonly _$filter: Signal<TFilter>;
  protected readonly _$page = signal(1);
  protected readonly _$searchTerm = signal<string>("");
  protected readonly _$options = signal<SelectOption[]>([]);
  protected readonly _$isOpen = signal<boolean>(false);
  protected readonly _$isLoading = signal<boolean>(false);
  protected readonly _$selectedValues = signal<string[]>([]);
  protected readonly _$selectedOptions = signal<SelectOption[]>([]);
  protected readonly _$isAllSelected = signal<boolean>(false);

  readonly $searchTerm = computed(() => this._$searchTerm());
  readonly $options = computed(() => this._$options());
  readonly $filteredOptions = computed(() => this.$options());
  readonly $isLoading = computed(() => this._$isLoading());
  readonly $isOpen = computed(() => this._$isOpen());
  readonly $selectedValues = computed(() => this._$selectedValues());
  readonly $selectedOptions = computed(() => this._$selectedOptions());
  readonly $isAllSelected = computed(() => this._$isAllSelected());

  constructor() {
    this._$filter = this.computeParams() as Signal<TFilter>;

    effect(() => {
      const filter = this._$filter();
      const isOpen = this._$isOpen();
      if (isOpen) {
        untracked(() => {
          this._$isLoading.set(true);
          this.fetchOptions(filter)
            .pipe(
              tap(options => {
                this._$options.set(options);
              }),
              finalize(() => this._$isLoading.set(false)),
              takeUntilDestroyed(this._destroyRef)
            )
            .subscribe();
        });
      }
    });
  }

  search(term: string): void {
    this._$searchTerm.set(term);
  }
  select(value: string): void {
    this._$selectedValues.update(values => [...values, value]);
  }
  unselect(value: string): void {
    this._$selectedValues.update(values => values.filter(v => v !== value));
  }
  toggle(value: string): void {
    this._$selectedValues.update(values =>
      values.includes(value) ? values.filter(v => v !== value) : [...values, value]
    );
  }
  clear(): void {
    this._$selectedValues.set([]);
  }

  setOpen(isOpen: boolean): void {
    this._$isOpen.set(isOpen);
  }

  nextPage(): void {
    this._$page.update(page => page + 1);
  }

  connectOptions($options: WritableSignal<SelectOption[]>): void {
    effect(
      () => {
        $options.set(this._$options());
      },
      { injector: this._injector }
    );
  }

  connectIsLoading($isLoading: WritableSignal<boolean>): void {
    effect(
      () => {
        $isLoading.set(this._$isLoading());
      },
      { injector: this._injector }
    );
  }

  protected abstract computeParams(): Signal<TFilter>;
  protected abstract fetchOptions(params: TFilter): Observable<SelectOption[]>;
}

export const provideApiSelectFacade = (
  classInstance: Type<MCApiSelectFacade>
): ClassProvider => {
  return provideSelectFacade(classInstance);
};
