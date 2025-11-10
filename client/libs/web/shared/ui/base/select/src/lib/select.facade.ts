import { ClassProvider, inject, InjectionToken, Signal, Type } from "@angular/core";
import { SelectOption } from "./select/select";

export type SelectFacade = {
  $searchTerm: Signal<string>;
  $options: Signal<SelectOption[]>;
  $filteredOptions: Signal<SelectOption[]>;
  $isLoading: Signal<boolean>;
  $isOpen: Signal<boolean>;
  $selectedValues: Signal<string[]>;
  $isAllSelected: Signal<boolean>;

  search(term: string): void;
  setOpen(isOpen: boolean): void;
  select(value: string): void;
  unselect(value: string): void;
  toggle(value: string): void;
  clear(): void;
};

const SELECT_FACADE_TOKEN = new InjectionToken<SelectFacade>("SelectFacade");

export const provideSelectFacade = (classInstance: Type<SelectFacade>): ClassProvider => {
  return {
    provide: SELECT_FACADE_TOKEN,
    useClass: classInstance,
  };
};

export const injectSelectFacade = (): SelectFacade => inject(SELECT_FACADE_TOKEN);
