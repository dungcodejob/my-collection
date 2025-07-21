import { Component, signal } from "@angular/core";
import { SelectOption, WebSharedUiSelectComponent } from "@client/web-shared-ui-select";
import { AppSidebarComponent } from "@client/web-shell-ui-sidebar";

@Component({
  selector: "mc-layout",
  imports: [AppSidebarComponent, WebSharedUiSelectComponent],
  templateUrl: "./mc-layout.html",
  styleUrl: "./mc-layout.css",
})
export class MCLayout {
  readonly $selectedValue = signal<string | null>(null);

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
}
