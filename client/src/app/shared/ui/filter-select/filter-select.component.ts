import { CommonModule } from "@angular/common";
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  computed,
  forwardRef,
  inject,
  input,
  OnInit,
  signal,
  untracked,
  viewChildren,
} from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import { provideIcons } from "@ng-icons/core";
import {
  lucideCalendar,
  lucidePlus,
  lucideRotateCw,
  lucideSearch,
  lucideSmile,
} from "@ng-icons/lucide";
import { injectAutoEffect, isNotNil } from "@shared/utils";
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
import { cva } from "class-variance-authority";
import { FilterOptionDirective } from "./filter-option.directive";
import { FilterOptionVM } from "./filter-option.vm";

export const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "underline-offset-4 hover:underline text-primary",
      },
      size: {
        default: "h-10 py-2 px-4",
        xs: "h-8 px-2 rounded-md",
        sm: "h-9 px-3 rounded-md",
        lg: "h-11 px-8 rounded-md",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

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

    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FilterSelectComponent),
      multi: true,
    },
  ],
})
export class FilterSelectComponent<T = unknown> implements ControlValueAccessor, OnInit {
  private readonly _autoEffect = injectAutoEffect();
  private readonly _cdr = inject(ChangeDetectorRef);

  $title = input("", { alias: "title" });
  $count = input(2, { alias: "count" });
  $getKeyFn = input(
    (value: T) => {
      if (typeof value === "object") {
        return (value as { id: string })["id"];
      }

      return `${value}`;
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

  selectedOptionMaps = new Map<string, FilterOptionVM<T>>();
  $selectedItems = signal<T[]>([]);

  $selectedDisplay = computed(() => {
    return;
  });

  ngOnInit(): void {
    this._autoEffect(() => {
      const options = this.$options();

      untracked(() => {
        const selectedItems = this.$selectedItems();
        const getKeyFn = this.$getKeyFn();
        for (const item of selectedItems) {
          const key = getKeyFn(item);
          const option = options.find(option => getKeyFn(option.value) === key);
          if (option) {
            this.selectedOptionMaps.set(key, {
              label: option.label,
              value: item,
            });
          }
        }
      });
    });
  }

  onChange!: (value: T[]) => void;
  onTouched!: () => void;

  isSelected(value: T) {
    return this.selectedOptionMaps.has(this.$getKeyFn()(value));
  }

  onToggle(option: FilterOptionVM<T>) {
    const key = this.$getKeyFn()(option.value);

    if (this.isSelected(option.value)) {
      this.selectedOptionMaps.delete(key);
    } else {
      this.selectedOptionMaps.set(key, option);
    }

    this._emitValue();
  }

  onClear() {
    this.selectedOptionMaps.clear();
    this._emitValue();
  }

  writeValue(obj: T[] | null | undefined): void {
    this.$selectedItems.set(obj ?? []);
    const options = this.$options();
    this.selectedOptionMaps.clear();
    if (isNotNil(obj) && options.length > 0) {
      const getKeyFn = this.$getKeyFn();
      for (const item of obj) {
        const key = getKeyFn(item);
        const option = this.$options().find(option => getKeyFn(option.value) === key);
        if (option) {
          this.selectedOptionMaps.set(key, {
            label: option.label,
            value: item,
          });
        }
      }
    }
    this._cdr.markForCheck();
  }
  registerOnChange(fn: (value: T[]) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  private _emitValue() {
    if (this.onChange) {
      const values = [...this.selectedOptionMaps.values()].map(item => item.value);
      this.$selectedItems.set(values);
      this.onChange(values);
    }
  }
}
