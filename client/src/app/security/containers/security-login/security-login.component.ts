import { JsonPipe, NgIf } from "@angular/common";
import { Component, Injector, OnInit, effect, inject } from "@angular/core";
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

import { HlmCheckboxComponent } from "@spartan-ng/ui-checkbox-helm";
import { HlmIconComponent } from "@spartan-ng/ui-icon-helm";
import { HlmInputDirective, HlmInputErrorDirective } from "@spartan-ng/ui-input-helm";
import { HlmLabelDirective } from "@spartan-ng/ui-label-helm";
import { SecurityLoginFacade } from "./security-login.facade";

type LoginForm = FormGroup<{
  username: FormControl<string>;
  password: FormControl<string>;
  remember: FormControl<boolean>;
}>;

@Component({
  selector: "app-login",
  standalone: true,
  imports: [
    NgIf,
    ReactiveFormsModule,
    JsonPipe,
    HlmInputErrorDirective,
    HlmLabelDirective,
    HlmInputDirective,
    HlmButtonDirective,
    HlmCheckboxComponent,
    HlmIconComponent,
  ],
  providers: [
    provideIcons({
      lucideLoader2,
    }),
    SecurityLoginFacade,
  ],
  templateUrl: "./security-login.component.html",
  styleUrl: "./security-login.component.scss",
})
export class SecurityLoginComponent implements OnInit {
  private readonly _injector = inject(Injector);
  private readonly _nonNullFB = inject(NonNullableFormBuilder);
  private readonly _loginFacade = inject(SecurityLoginFacade);

  $error = this._loginFacade.$error;
  $isPending = this._loginFacade.$isPending;

  loginForm!: LoginForm;

  get username() {
    return this.loginForm.controls.username;
  }

  get password() {
    return this.loginForm.controls.password;
  }

  ngOnInit(): void {
    this._loginFacade.enter();
    this._initForm();

    effect(
      () => {
        const loading = this._loginFacade.$isPending();
        if (loading) {
          this.loginForm.disable();
        } else {
          this.loginForm.enable();
        }
      },
      { injector: this._injector }
    );
  }

  private _initForm() {
    this.loginForm = this._nonNullFB.group<LoginForm["controls"]>({
      username: this._nonNullFB.control("", { validators: Validators.required }),
      password: this._nonNullFB.control("", { validators: Validators.required }),
      remember: this._nonNullFB.control(false),
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
