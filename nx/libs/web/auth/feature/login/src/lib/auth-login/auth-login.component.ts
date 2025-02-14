import { CommonModule } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  Injector,
  effect,
  inject,
} from "@angular/core";
import { FormControl, FormGroup, NonNullableFormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { AuthLoginFacade } from "./auth-login.facade";

type LoginForm = FormGroup<{
  username: FormControl<string>;
  password: FormControl<string>;
  remember: FormControl<boolean>;
}>;

@Component({
  selector: "app-auth-feature-login",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  providers: [AuthLoginFacade],
  templateUrl: "./auth-login.component.html",
  styleUrl: "./auth-login.component.css",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthLoginComponent {
  private readonly _injector = inject(Injector);
  private readonly _nonNullFB = inject(NonNullableFormBuilder);
  private readonly _loginFacade = inject(AuthLoginFacade);

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
    this._initForm();
    this._registerLoadingEffect();
  }

  onSubmit() {
    if (this.loginForm.valid) {
      const body = this.loginForm.getRawValue();
      this._loginFacade.login(body.username, body.password);
    } else {
      this.loginForm.updateValueAndValidity();
    }
  }

  private _initForm() {
    this.loginForm = this._nonNullFB.group<LoginForm["controls"]>({
      username: this._nonNullFB.control("", { validators: Validators.required }),
      password: this._nonNullFB.control("", { validators: Validators.required }),
      remember: this._nonNullFB.control(false),
    });
  }

  private _registerLoadingEffect() {
    effect(
      () => {
        const loading = this._loginFacade.$isPending();
        loading ? this.loginForm.disable() : this.loginForm.enable();
      },
      { injector: this._injector }
    );
  }
}
