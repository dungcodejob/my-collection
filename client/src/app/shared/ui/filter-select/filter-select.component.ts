import { CommonModule } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  viewChildren,
} from "@angular/core";
import { ControlValueAccessor } from "@angular/forms";
import { provideIcons } from "@ng-icons/core";
import {
  lucideCalendar,
  lucidePlus,
  lucideRotateCw,
  lucideSearch,
  lucideSmile,
} from "@ng-icons/lucide";
import { isNotNil } from "@shared/utils";
import { HlmBadgeDirective } from "@spartan-ng/ui-badge-helm";
import { HlmButtonDirective } from "@spartan-ng/ui-button-helm";
import { HlmCheckboxComponent } from "@spartan-ng/ui-checkbox-helm";
import { BrnCommandImports } from "@spartan-ng/ui-command-brain";
import { HlmCommandImports } from "@spartan-ng/ui-command-helm";
import { HlmIconComponent } from "@spartan-ng/ui-icon-helm";
import { HlmInputDirective } from "@spartan-ng/ui-input-helm";
import { HlmLabelDirective } from "@spartan-ng/ui-label-helm";
import {
  BrnPopoverCloseDirective,
  BrnPopoverComponent,
  BrnPopoverContentDirective,
  BrnPopoverTriggerDirective,
} from "@spartan-ng/ui-popover-brain";
import {
  HlmPopoverCloseDirective,
  HlmPopoverContentDirective,
} from "@spartan-ng/ui-popover-helm";
import { BrnSeparatorComponent } from "@spartan-ng/ui-separator-brain";
import { HlmSeparatorDirective } from "@spartan-ng/ui-separator-helm";
import { FilterOptionDirective } from "./filter-option.directive";
import { FilterOptionVM } from "./filter-option.vm";

const lucideCirclePlus = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-circle-plus"><circle cx="12" cy="12" r="10"/><path d="M8 12h8"/><path d="M12 8v8"/></svg>`;

const PopoverImports = [
  BrnPopoverComponent,
  BrnPopoverTriggerDirective,
  BrnPopoverContentDirective,
  BrnPopoverCloseDirective,
  HlmPopoverContentDirective,
  HlmPopoverCloseDirective,
];

const CommandImports = [
  BrnCommandImports,
  HlmCommandImports,
  HlmIconComponent,
  HlmButtonDirective,
];

@Component({
  selector: "app-filter-select",
  standalone: true,
  templateUrl: "./filter-select.component.html",
  styleUrl: "./filter-select.component.css",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    PopoverImports,
    CommandImports,
    HlmButtonDirective,
    HlmLabelDirective,
    HlmInputDirective,
    HlmIconComponent,
    HlmCheckboxComponent,
    HlmLabelDirective,
    HlmBadgeDirective,
    HlmSeparatorDirective,
    BrnSeparatorComponent,
  ],
  providers: [
    provideIcons({
      lucideRotateCw,
      lucideCirclePlus,
      lucideSearch,
      lucideCalendar,
      lucideSmile,
      lucidePlus,
    }),
  ],
})
export class FilterSelectComponent<T = unknown> implements ControlValueAccessor {
  $title = input("", { alias: "title" });
  $count = input(2, { alias: "count" });
  $getKeyFn = input(
    (value: any) => {
      if (typeof value === "object") {
        return value["id"];
      }

      return value;
    },
    { alias: "getKeyFn" }
  );
  $optionInputs = input<FilterOptionVM<T>[] | T[]>([], { alias: "options" });
  $optionChildren = viewChildren(FilterOptionDirective<T>);

  $options = computed(() => {
    const optionChildren = this.$optionChildren();
    if (optionChildren && optionChildren.length > 0) {
      return optionChildren.map(child => ({
        label: child.$label(),
        value: child.$value(),
      }));
    }

    const optionInputs = this.$optionInputs();
    if (optionInputs && optionInputs.length > 0) {
      return optionInputs.map(item => {
        if (typeof item === "object") {
          return item as FilterOptionVM<T>;
        }
        return {
          label: `${item}`,
          value: item,
        };
      });
    }

    return [];
  });

  selectedItems = new Map<string, FilterOptionVM<T>>();

  $selectedDisplay = computed(() => {
    return;
  });
  onChange!: (value: T[]) => void;
  onTouched!: () => void;

  isSelected(value: T) {
    return this.selectedItems.has(this.$getKeyFn()(value));
  }

  onToggle(option: FilterOptionVM<T>) {
    console.log("onToggle", option);
    const key = this.$getKeyFn()(option.value);

    if (this.isSelected(option.value)) {
      this.selectedItems.delete(key);
    } else {
      this.selectedItems.set(key, option);
    }

    this.onChange
      ? this.onChange([...this.selectedItems.values()].map(item => item.value))
      : null;
  }

  onClear() {
    this.selectedItems.clear();
  }

  writeValue(obj: T[] | null | undefined): void {
    if (isNotNil(obj)) {
      for (const item of obj) {
        const key = this.$getKeyFn()(item);
        this.selectedItems.set(key, {
          label: `${item}`,
          value: item,
        });
      }
    }
  }
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
}
