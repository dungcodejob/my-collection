# Web Shared UI Select Component

Một component select hiện đại được xây dựng với Angular và Spartan UI, hỗ trợ signals và các tính năng mới nhất của Angular.

## Tính năng

- ✅ Sử dụng Angular Signals cho reactive state management
- ✅ Tích hợp với Spartan UI (Brain + Helm)
- ✅ Hỗ trợ TypeScript đầy đủ
- ✅ Accessibility (a11y) được tích hợp sẵn
- ✅ Customizable với nhiều size và variant
- ✅ Animation mượt mà
- ✅ Test coverage hoàn chỉnh
- ✅ Keyboard navigation
- ✅ Disabled options support
- ✅ **Tính năng tìm kiếm** - Lọc options bằng cách gõ
- ✅ **Lọc thời gian thực** - Tìm kiếm trong cả label và value
- ✅ **Xóa tìm kiếm** - Dễ dàng xóa từ khóa tìm kiếm
- ✅ **Keyboard navigation**: Full keyboard support với arrow keys, Enter, Escape, Home, End
- ✅ **Focus management**: Proper focus handling và visual indicators
- ✅ **High contrast support**: Enhanced visibility trong high contrast mode
- ✅ **Reduced motion support**: Respects user's motion preferences

## Cài đặt

```bash
npm install @spartan-ng/ui-select-brain @spartan-ng/ui-select-helm @ng-icons/core @ng-icons/lucide
```

Đảm bảo bạn đã cấu hình TailwindCSS với Spartan UI preset:

```javascript
// tailwind.config.js
module.exports = {
  presets: [require("@spartan-ng/brain/hlm-tailwind-preset")],
  // ... other config
};
```

## Sử dụng cơ bản

```typescript
import { Component, signal } from "@angular/core";
import { WebSharedUiSelectComponent, SelectOption } from "@your-org/web-shared-ui-select";
import { BrnSelectImports } from "@spartan-ng/ui-select-brain";
import { HlmSelectImports } from "@spartan-ng/ui-select-helm";

@Component({
  selector: "app-example",
  imports: [WebSharedUiSelectComponent],
  template: `
    <!-- Basic Select -->
    <app-select
      [options]="options()"
      [placeholder]="'Chọn một tùy chọn...'"
      [value]="selectedValue()"
      (valueChange)="onValueChange($event)"
      (selectionChange)="onSelectionChange($event)"
    />

    <!-- Searchable Select -->
    <app-select
      [options]="options()"
      [placeholder]="'Tìm kiếm và chọn...'"
      [value]="selectedValue()"
      [isSearchable]="true"
      (valueChange)="onValueChange($event)"
      (selectionChange)="onSelectionChange($event)"
    />
  `,
})
export class ExampleComponent {
  selectedValue = signal<string | null>(null);

  options = signal<SelectOption[]>([
    { value: "apple", label: "Apple" },
    { value: "banana", label: "Banana" },
    { value: "orange", label: "Orange", disabled: true },
  ]);

  onValueChange(value: string) {
    this.selectedValue.set(value);
    console.log("Selected value:", value);
  }

  onSelectionChange(option: SelectOption) {
    console.log("Selected option:", option);
  }
}
```

## API

### Inputs

| Property      | Type                                | Default                 | Mô tả                       |
| ------------- | ----------------------------------- | ----------------------- | --------------------------- |
| `options`     | `SelectOption[]`                    | **required**            | Danh sách các tùy chọn      |
| `placeholder` | `string`                            | `'Select an option...'` | Text hiển thị khi chưa chọn |
| `disabled`    | `boolean`                           | `false`                 | Vô hiệu hóa component       |
| `value`       | `string \| null`                    | `null`                  | Giá trị được chọn           |
| `size`        | `'sm' \| 'md' \| 'lg'`              | `'md'`                  | Kích thước component        |
| `variant`     | `'default' \| 'outline' \| 'ghost'` | `'default'`             | Kiểu hiển thị               |
| `isSearchable` | `boolean`                          | `false`                 | Bật tính năng tìm kiếm      |

### Outputs

| Event             | Type           | Mô tả                        |
| ----------------- | -------------- | ---------------------------- |
| `valueChange`     | `string`       | Phát ra khi giá trị thay đổi |
| `selectionChange` | `SelectOption` | Phát ra khi option được chọn |

## Keyboard Navigation

| Key | Action |
|-----|--------|
| `Arrow Down` | Navigate to next option or move from search to first option |
| `Arrow Up` | Navigate to previous option or move from search to last option |
| `Enter` | Select focused option or first filtered option from search |
| `Escape` | Close select dropdown |
| `Home` | Focus first option |
| `End` | Focus last option |
| `Tab` | Navigate to next focusable element |
| `Shift + Tab` | Navigate to previous focusable element |

## Accessibility Features

- **ARIA Support**: Proper ARIA attributes for screen readers
- **Keyboard Navigation**: Full keyboard accessibility
- **Focus Management**: Clear focus indicators and logical tab order
- **Screen Reader Support**: Descriptive labels and live regions
- **High Contrast Mode**: Enhanced visibility in high contrast environments
- **Reduced Motion**: Respects user's motion preferences

### SelectOption Interface

```typescript
export interface SelectOption {
  value: string; // Giá trị duy nhất
  label: string; // Text hiển thị
  disabled?: boolean; // Vô hiệu hóa option (optional)
}
```

## Ví dụ nâng cao

### Với form reactive

```typescript
import { Component } from "@angular/core";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { WebSharedUiSelectComponent } from "@your-org/web-shared-ui-select";

@Component({
  selector: "app-form-example",
  imports: [WebSharedUiSelectComponent, ReactiveFormsModule],
  template: `
    <form>
      <app-select
        [options]="countries"
        [value]="countryControl.value"
        (valueChange)="countryControl.setValue($event)"
        placeholder="Chọn quốc gia"
      />
    </form>
  `,
})
export class FormExampleComponent {
  countryControl = new FormControl<string | null>(null);

  countries = [
    { value: "vn", label: "Việt Nam" },
    { value: "us", label: "United States" },
    { value: "jp", label: "Japan" },
    { value: "kr", label: "South Korea" },
    { value: "cn", label: "China" },
    { value: "th", label: "Thailand" },
  ];

  // Ví dụ với tìm kiếm cho danh sách dài
  programmingLanguages = [
    { value: "javascript", label: "JavaScript" },
    { value: "typescript", label: "TypeScript" },
    { value: "python", label: "Python" },
    { value: "java", label: "Java" },
    { value: "csharp", label: "C#" },
    { value: "go", label: "Go" },
    { value: "rust", label: "Rust" },
    { value: "php", label: "PHP" },
  ];
}
```

### Với size và variant khác nhau

```typescript
@Component({
  template: `
    <!-- Small size -->
    <app-select [options]="options" size="sm" placeholder="Small select" />

    <!-- Large size với outline variant -->
    <app-select
      [options]="options"
      size="lg"
      variant="outline"
      placeholder="Large outline select"
    />

    <!-- Ghost variant -->
    <app-select [options]="options" variant="ghost" placeholder="Ghost select" />
  `,
})
export class VariantExampleComponent {
  // ...
}
```

## Styling

Component sử dụng CSS custom properties từ design system. Bạn có thể override các giá trị sau:

```css
:root {
  --border: 214.3 31.8% 91.4%;
  --ring: 222.2 84% 4.9%;
  --accent: 210 40% 98%;
  --muted: 210 40% 96%;
  --muted-foreground: 215.4 16.3% 46.9%;
  --foreground: 222.2 84% 4.9%;
}
```

## Accessibility

- Hỗ trợ keyboard navigation (Arrow keys, Enter, Escape)
- ARIA attributes được thiết lập tự động
- Screen reader friendly
- Focus management
- High contrast mode support

## Running unit tests

Run `nx test web-shared-ui-select` to execute the unit tests.

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
