import { Component, signal } from "@angular/core";
import { SelectOption, WebSharedUiSelectComponent } from "@client/web-shared-ui-select";
import { AppSidebarComponent } from "@client/web-shell-ui-sidebar";
import { ExampleSelectApiDirective } from "./example-select-api.directive";

@Component({
  selector: "mc-layout",
  imports: [AppSidebarComponent, WebSharedUiSelectComponent, ExampleSelectApiDirective],
  templateUrl: "./mc-layout.html",
  styleUrl: "./mc-layout.css",
  hostDirectives: [],
})
export class MCLayout {
  readonly $selectedValue = signal<string | null>(null);
  readonly $selectedApiValue = signal<string | null>(null);

  readonly testOptions: SelectOption[] = [
    { value: "angular", label: "Angular" },
    { value: "typescript", label: "TypeScript" },
    { value: "spartan", label: "Spartan UI" },
    { value: "react", label: "React" },
    { value: "vue", label: "Vue.js" },
    { value: "svelte", label: "Svelte" },
    { value: "javascript", label: "JavaScript" },
    { value: "python", label: "Python" },
    { value: "java", label: "Java" },
    { value: "csharp", label: "C#" },
  ];

  onSelectionChange(option: SelectOption): void {
    console.log("Selected option:", option);
  }

  onValueChange(value: string): void {
    console.log("Selected value:", value);
    this.$selectedValue.set(value);
  }

  onApiSelectionChange(option: SelectOption): void {
    console.log("API Selected option:", option);
  }

  onApiValueChange(value: string): void {
    console.log("API Selected value:", value);
    this.$selectedApiValue.set(value);
  }
}
