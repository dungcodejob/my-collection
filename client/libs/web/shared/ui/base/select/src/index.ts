import { MCFilterTrigger } from "./lib/filter-trigger.ts/filter.trigger";
import { MCMultiSelect } from "./lib/multi-select/multi-select";
import { MCMultiSelectTrigger } from "./lib/multi-select/multi-select-trigger.directive";
import { MCSelect } from "./lib/select/select";
import { MCSelectApi } from "./lib/select/select-api.directive";
import { MCSelectTrigger } from "./lib/select/select-trigger.directive";

export * from "./lib/filter-trigger.ts/filter.trigger";
export * from "./lib/multi-select/multi-select";
export * from "./lib/multi-select/multi-select-trigger.directive";
export * from "./lib/select/select";
export * from "./lib/select/select-api.directive";
export * from "./lib/select/select-trigger.directive";

export const MCSelectImports = [
  MCSelect,
  MCSelectApi,
  MCSelectTrigger,
  MCFilterTrigger,
  MCMultiSelect,
  MCMultiSelectTrigger,
];
export const MCMultiSelectImports = [MCMultiSelect, MCMultiSelectTrigger];
