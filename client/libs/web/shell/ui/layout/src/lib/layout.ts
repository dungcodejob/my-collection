import { Component, inject, signal } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { CollectionStore } from "@client/web-collection-data-access";
import { MCCollectionList } from "@client/web-collection-feature-list";
import { SelectOption } from "@client/web-shared-ui-select";
import { MCHeader } from "@client/web-shell-ui-header";
import { MCSidebar } from "@client/web-shell-ui-sidebar";
import { HlmSeparatorImports } from "@spartan-ng/helm/separator";

@Component({
  selector: "mc-layout",
  imports: [MCSidebar, MCHeader, HlmSeparatorImports, RouterOutlet, MCCollectionList],
  templateUrl: "./layout.html",
  styleUrl: "./layout.css",
})
export class MCLayout {
  collectionStore = inject(CollectionStore);

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
