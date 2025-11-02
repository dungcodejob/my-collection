import { CommonModule } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  Injector,
  OnInit,
} from "@angular/core";
import {
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { HlmAlert } from "@spartan-ng/helm/alert";
import { HlmButton } from "@spartan-ng/helm/button";
import {
  HlmCardContent,
  HlmCard,
  HlmCardFooter,
  HlmCardHeader,
} from "@spartan-ng/helm/card";
import { HlmCheckboxImports } from "@spartan-ng/helm/checkbox";
import { HlmInput } from "@spartan-ng/helm/input";
import { HlmLabel } from "@spartan-ng/helm/label";
import { AuthLoginFacade } from "./auth-login.facade";

type LoginForm = FormGroup<{
  username: FormControl<string>;
  password: FormControl<string>;
  remember: FormControl<boolean>;
}>;

@Component({
  selector: "lib-auth-login",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HlmButton,
    HlmInput,
    ...HlmCheckboxImports,
    HlmCard,
    HlmCardContent,
    HlmCardHeader,
    HlmCardFooter,
    HlmAlert,
    HlmLabel,
  ],
  providers: [AuthLoginFacade],
  templateUrl: "./auth-login.html",
  styleUrl: "./auth-login.css",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthLogin implements OnInit {
  private readonly _injector = inject(Injector);
  private readonly _nonNullFB = inject(NonNullableFormBuilder);
  private readonly _loginFacade = inject(AuthLoginFacade);

  $error = this._loginFacade.$error;
  $isPending = this._loginFacade.$isPending;

  loginForm!: LoginForm;

  get username(): FormControl<string> {
    return this.loginForm.controls.username;
  }

  get password(): FormControl<string> {
    return this.loginForm.controls.password;
  }

  ngOnInit(): void {
    this.initForm();
    this._registerLoadingEffect();
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      const body = this.loginForm.getRawValue();
      this._loginFacade.login({
        emailOrUsername: body.username,
        password: body.password,
      });
    } else {
      this.loginForm.updateValueAndValidity();
    }
  }

  private initForm(): void {
    this.loginForm = this._nonNullFB.group<LoginForm["controls"]>({
      username: this._nonNullFB.control("", { validators: Validators.required }),
      password: this._nonNullFB.control("", { validators: Validators.required }),
      remember: this._nonNullFB.control(false),
    });
  }

  private _registerLoadingEffect(): void {
    effect(
      () => {
        const loading = this._loginFacade.$isPending();
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        loading ? this.loginForm.disable() : this.loginForm.enable();
      },
      { injector: this._injector }
    );
  }
}
