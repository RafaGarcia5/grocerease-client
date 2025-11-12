import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ProfileComponent } from './profile';
import { UserService } from '../../core/services/user.service';
import { NotificationService } from '../../core/services/notification.service';
import { of, throwError } from 'rxjs';

describe('Profile', () => {
  let component: ProfileComponent;
  let fixture: ComponentFixture<ProfileComponent>;
  let mockUserService: jasmine.SpyObj<UserService>;
  let mockNotification: jasmine.SpyObj<NotificationService>;
  
  const mockUser = {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    role: 'customer',
    address: {
      addressLine1: 'Street 1',
      addressLine2: '',
      zipCode: '12345',
      colony: 'Colony',
      city: 'City',
      state: 'State'
    },
    payment: 'cash'
  };

  beforeEach(async () => {
    mockUserService = jasmine.createSpyObj('UserService', ['updateUser']);
    mockNotification = jasmine.createSpyObj('NotificationService', ['showSuccess', 'showError']);

    spyOn(localStorage, 'getItem').and.returnValue(JSON.stringify(mockUser));
    spyOn(localStorage, 'setItem');

    await TestBed.configureTestingModule({
      imports: [ProfileComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: UserService, useValue: mockUserService },
        { provide: NotificationService, useValue: mockNotification }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('when initializing', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });
  
    it('should initialize the form with user data and disable it', () => {
      expect(component.profileForm.value.name).toBe(mockUser.name);
      expect(component.profileForm.value.email).toBe(mockUser.email);
      expect(component.profileForm.value.address.addressLine1).toBe(mockUser.address.addressLine1);
      expect(component.profileForm.value.payment).toBe(mockUser.payment);
      expect(component.profileForm.disabled).toBeTrue();
    });
  });

  describe('when editing profile', () => {
    it('should enable editing mode and all form control', () => {
      component.enableEditing();
      expect(component.isEditing).toBeTrue();
      Object.keys(component.profileForm.controls).forEach(key => {
        expect(component.profileForm.get(key)?.enabled).toBeTrue();
      });
    });

    it('should cancel editing and reset form to original values', () => {
      component.enableEditing();
      component.profileForm.patchValue({ name: 'Changed' });
      component.cancelEditing();
  
      expect(component.isEditing).toBeFalse();
      expect(component.profileForm.value.name).toBe(mockUser.name);
      expect(component.profileForm.disabled).toBeTrue();
    });
  });

  describe('when saving changes', () => {
    it('should save changes successfully', () => {
      const updatedUser = { ...mockUser, name: 'Jane Doe' };
      mockUserService.updateUser.and.returnValue(of(updatedUser));
      
      component.enableEditing();
      component.profileForm.patchValue({ name: 'Jane Doe' });
  
      component.saveChanges();
  
      expect(mockUserService.updateUser).toHaveBeenCalledWith(mockUser.id, jasmine.any(Object));
      expect(localStorage.setItem).toHaveBeenCalledWith('user', JSON.stringify(updatedUser));
      expect(mockNotification.showSuccess).toHaveBeenCalledWith('Changes saved', 'Your information has been updated');
      expect(component.isEditing).toBeFalse();
    });

    it('should handle error when update failsr', () => {
      const error = { error: { message: 'Server error' } };
      mockUserService.updateUser.and.returnValue(throwError(() => error));
  
      component.enableEditing();
      component.profileForm.patchValue({ name: 'Jane Doe' });
  
      component.saveChanges();
  
      expect(mockNotification.showError).toHaveBeenCalledWith('Update failed', 'Try again later');
    });

    it('should mark all fields as touched if form is invalid', () => {
      component.enableEditing();
      component.profileForm.patchValue({ name: '' });
      spyOn(component.profileForm, 'markAllAsTouched');
  
      component.saveChanges();
  
      expect(component.profileForm.markAllAsTouched).toHaveBeenCalled();
      expect(mockUserService.updateUser).not.toHaveBeenCalled();
    });
  });
});
