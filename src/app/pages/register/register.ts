import { Component, signal, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule, FormControl, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatRadioModule } from '@angular/material/radio';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NotificationService } from '../../core/services/notification.service';
import { AUTH_MESSAGES as authMessages } from '../../core/constants/messages';
import { Auth } from '../../core/services/auth';
import { NavigationService } from '../../core/services/navigation.service';
import { APP_ROUTES } from '../../core/constants/app-routes';

export function confirmPasswordValidator(passwordControl: () => AbstractControl | null): ValidatorFn {
  return (confirmControl: AbstractControl): ValidationErrors | null => {
    const password = passwordControl()?.value;
    const confirm = confirmControl.value;

    if (!password || !confirm) return null;

    return password === confirm ? null : { passwordMismatch: true };
  };
}


@Component({
  selector: 'app-register',
  imports: [
    RouterModule,
    FormsModule,
    MatInputModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatRadioModule,
    MatButtonModule,
    MatProgressSpinnerModule
],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register implements OnInit{
  readonly routes = APP_ROUTES;
  loading = signal(false);

  registerForm = new FormGroup({
    name : new FormControl('', Validators.required), 
    email : new FormControl('', [Validators.required, Validators.email]),
    password : new FormControl('', [Validators.required, Validators.minLength(8), Validators.maxLength(15)]),
    password_confirmation : new FormControl('', Validators.required),
    role : new FormControl('customer', Validators.required),
    address : new FormGroup({
      addressLine1: new FormControl('', Validators.required),
      addressLine2: new FormControl(''),
      zipCode: new FormControl('',[Validators.required, Validators.maxLength(5)]),
      colony: new FormControl('', Validators.required),
      city: new FormControl('', Validators.required),
      state: new FormControl('', Validators.required)
    }),
    payment : new FormControl('')
  });

  constructor(
    private authService: Auth,
    private notification: NotificationService,
    private navigation: NavigationService
  ){}
  
  ngOnInit(): void {
    this.registerForm.get('password_confirmation')?.setValidators([
      Validators.required,
      confirmPasswordValidator(() => this.registerForm.get('password'))
    ]);
  
    this.registerForm.get('password')?.valueChanges.subscribe(() => {
      this.registerForm.get('password_confirmation')?.updateValueAndValidity();
    });
  }

  onSubmit() {
    if (this.registerForm.valid) {
      this.loading.set(true);
      const formData = this.registerForm.value;

      this.authService.register(formData).subscribe({
        next: (response) => {
          this.authService.handleAuthSuccess(response);
          this.loading.set(false);
          this.notification.showSuccess(authMessages.success.register.title, authMessages.success.register.message(response.user.name));
          this.navigation.goToHome();
        },
        error: (err) => {
          this.loading.set(false);
          console.error(err);

          const backendErrors = err?.error?.errors;
          if (backendErrors) {
            if (backendErrors.email?.length) {
              this.registerForm.get('email')?.setErrors({
                backend: backendErrors.email[0]
              });
            }
          }
          this.notification.showError(authMessages.error.register.title, authMessages.error.register.message(err?.error?.message));
        }
      });
    }
  }
}
