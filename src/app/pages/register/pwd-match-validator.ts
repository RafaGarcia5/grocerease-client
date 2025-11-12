import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export const passwordMatchValidator: ValidatorFn = (formGroup: AbstractControl): ValidationErrors | null => {
  const password = formGroup.get('password')?.value;
  const confirm = formGroup.get('password_confirmation')?.value;
  return password === confirm ? null : { passwordMismatch: true };
};
