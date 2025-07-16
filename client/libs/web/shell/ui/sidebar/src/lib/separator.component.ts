import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, input } from "@angular/core";

@Component({
  selector: "mc-separator",
  imports: [CommonModule],
  template: `
    <div
      role="separator"
      [attr.aria-orientation]="orientation()"
      [class]="getSeparatorClasses()"
    ></div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SeparatorComponent {
  readonly orientation = input<"horizontal" | "vertical">("horizontal");

  protected getSeparatorClasses(): string {
    const baseClasses = "bg-gray-200 dark:bg-gray-800";

    if (this.orientation() === "horizontal") {
      return `${baseClasses} h-px w-full`;
    } else {
      return `${baseClasses} w-px h-full`;
    }
  }
}
