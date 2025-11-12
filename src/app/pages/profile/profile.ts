import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { User } from '../../models/auth.model';
import { UserService } from '../../core/services/user.service';
import { NotificationService } from '../../core/services/notification.service';
import { PROFILE_MESSAGE as profileMessages } from '../../core/constants/messages';
import { Auth } from '../../core/services/auth';

@Component({
  selector: 'app-profile',
  imports: [
    FormsModule, 
    ReactiveFormsModule, 
    MatInputModule, 
    MatCardModule, 
    MatButtonModule, 
    MatSelectModule,
  ],
  templateUrl: './profile.html',
  styleUrls: ['./profile.css']
})
export class ProfileComponent implements OnInit {
  profileForm!: FormGroup;
  isEditing = false;
  userId!: number;
  originalUserData!: User;

  constructor(
    private userApi: UserService, 
    private notification: NotificationService,
    private authService: Auth
  ) {}

  ngOnInit(): void {
    const user = this.authService.currentUser;
    if (!user?.id) return;

    this.userId = user.id;
    this.originalUserData = user;

    this.profileForm = new FormGroup({
      name: new FormControl({ value: user.name, disabled: true }, Validators.required),
      email: new FormControl({ value: user.email, disabled: true }, [Validators.required, Validators.email]),
      address: new FormGroup({
        addressLine1: new FormControl({ value: user.address?.addressLine1 || '', disabled: true }),
        addressLine2: new FormControl({ value: user.address?.addressLine2 || '', disabled: true }),
        zipCode: new FormControl({ value: user.address?.zipCode || '', disabled: true }),
        colony: new FormControl({ value: user.address?.colony || '', disabled: true }),
        city: new FormControl({ value: user.address?.city || '', disabled: true }),
        state: new FormControl({ value: user.address?.state || '', disabled: true })
      }),
      payment: new FormControl({ value: user.payment ?? '', disabled: true })
    });
  }

  enableEditing(): void {
    this.isEditing = true;
    Object.keys(this.profileForm.controls).forEach(key => {
      this.profileForm.get(key)?.enable();
    });
  }

  cancelEditing(): void {
    this.isEditing = false;
    this.ngOnInit();
  }

  saveChanges(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.userApi.updateUser(this.userId, this.profileForm.getRawValue()).subscribe({
      next: (updatedUser) => {
        this.authService.updateUser(updatedUser);
        this.originalUserData = updatedUser;
        this.isEditing = false;
        this.ngOnInit();

        this.notification.showSuccess(profileMessages.success.updated.title, profileMessages.success.updated.message);
      },
      error: (err) => {
        this.notification.showError(profileMessages.error.updatedFailed.title, profileMessages.error.updatedFailed.message);
        console.error(err.error.message);
      }
    });
  }
}
