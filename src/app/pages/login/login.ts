import { Component, signal, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule, FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatRadioModule } from '@angular/material/radio';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { Auth } from '../../core/services/auth';
import { NotificationService } from '../../core/services/notification.service';
import { AUTH_MESSAGES as authMessages } from '../../core/constants/messages';
import { NavigationService } from '../../core/services/navigation.service';
import { APP_ROUTES } from '../../core/constants/app-routes';

@Component({
  selector: 'app-login',
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
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login implements OnInit {
  readonly routes = APP_ROUTES;
  loading = signal(false);
  invalidCredentials = false;

  loginForm = new FormGroup({
    email : new FormControl('', [Validators.required, Validators.email]),
    password : new FormControl('', [Validators.required, Validators.minLength(4), Validators.maxLength(12)]),
  });
  
  constructor(
    private authService: Auth, 
    private navigation: NavigationService, 
    private notification: NotificationService,
  ){}
  
  ngOnInit(): void {
    this.loginForm.valueChanges.subscribe(() => {
      this.invalidCredentials = false;
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.loading.set(true);
      const formData = this.loginForm.value;

      this.authService.login(formData).subscribe({
        next: (response) => {
          this.authService.handleAuthSuccess(response);
          this.loading.set(false);
          this.notification.showSuccess(authMessages.success.login.title, authMessages.success.login.message(response.user.name));
          this.navigation.goToHome();
        },
        error: (err) => {
          this.loading.set(false);
          this.invalidCredentials = true;
          this.loginForm.get('email')?.setErrors({ invalidCredentials: true });
          this.loginForm.get('password')?.setErrors({ invalidCredentials: true });
        }
      });
    }
  }

  hide = signal(true);
  clickEvent(event: MouseEvent) {
    this.hide.set(!this.hide());
    event.stopPropagation();
  }
}
