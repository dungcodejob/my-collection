import { JsonPipe } from "@angular/common";
import { Component, OnInit, inject } from "@angular/core";
import {
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { provideIcons } from "@ng-icons/core";
import { lucideLoader2 } from "@ng-icons/lucide";
import { HlmButtonDirective } from "@spartan-ng/ui-button-helm";
import { HlmIconComponent } from "@spartan-ng/ui-icon-helm";
import { HlmInputDirective } from "@spartan-ng/ui-input-helm";
import { LoginFacade } from "./login.facade.ts";
@Component({
  selector: "app-login",
  standalone: true,
  imports: [
    ReactiveFormsModule,
    JsonPipe,
    HlmInputDirective,
    HlmButtonDirective,
    HlmIconComponent,
  ],
  providers: [
    provideIcons({
      lucideLoader2,
    }),
    LoginFacade,
  ],
  templateUrl: "./login.component.html",
  styleUrl: "./login.component.scss",
})
export class LoginComponent implements OnInit {
  private readonly _nonNullFB = inject(NonNullableFormBuilder);
  private readonly _loginFacade = inject(LoginFacade);

  $vm = this._loginFacade.$vm;

  loginForm!: FormGroup<{
    email: FormControl<string>;
    password: FormControl<string>;
  }>;

  ngOnInit(): void {
    this._loginFacade.enter();
    this._initForm();
  }

  private _initForm() {
    this.loginForm = this._nonNullFB.group({
      email: this._nonNullFB.control("", { validators: Validators.required }),
      password: this._nonNullFB.control("", { validators: Validators.required }),
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      const body = this.loginForm.getRawValue();
      this._loginFacade.login(body);
    } else {
      this.loginForm.updateValueAndValidity();
    }
  }
}
