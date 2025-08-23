import { NgModule } from "@angular/core";
import { MCConfirmActionDirective } from "./confirm-action.directive";
import { MCConfirmDialogComponent } from "./confirm-dialog.component";

@NgModule({
  imports: [MCConfirmDialogComponent, MCConfirmActionDirective],
  exports: [MCConfirmDialogComponent, MCConfirmActionDirective],
})
export class MCConfirmDialogModule {}
