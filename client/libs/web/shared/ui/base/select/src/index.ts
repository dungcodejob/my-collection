import { MCApiSelectFacade } from "./lib/api-select.facade";
import { MCFilterTrigger } from "./lib/filter-trigger.ts/filter.trigger";
import { MCMultiSelect } from "./lib/multi-select/multi-select";
import { MCMultiSelectTrigger } from "./lib/multi-select/multi-select-trigger.directive";
import { MCSelect } from "./lib/select/select";
import { MCSelectTrigger } from "./lib/select/select-trigger.directive";

export * from "./lib/api-select.facade";
export * from "./lib/filter-trigger.ts/filter.trigger";
export * from "./lib/multi-select/multi-select";
export * from "./lib/multi-select/multi-select-trigger.directive";
export * from "./lib/select/select";
export * from "./lib/select/select-trigger.directive";

export const MCSelectImports = [
  MCSelect,
  MCApiSelectFacade,
  MCSelectTrigger,
  MCFilterTrigger,
];
export const MCMultiSelectImports = [MCMultiSelect, MCMultiSelectTrigger];
