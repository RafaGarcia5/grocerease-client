import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CategoryService } from '../../core/services/category.service';
import { Category } from '../../models/category.model';
import { MatFormField, MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { NotificationService } from '../../core/services/notification.service';
import { CATEGORY_MESSAGES as categoryMessages } from '../../core/constants/messages';

@Component({
  selector: 'app-category-form',
  imports: [
    ReactiveFormsModule,
    MatInputModule,
    MatFormField,
    MatButtonModule,
    MatFormFieldModule
  ],
  templateUrl: './category-form.html',
  styleUrl: './category-form.css'
})
export class CategoryForm implements OnInit{
  form!: FormGroup;
  isEdit = false;

  constructor(
    private categoryService: CategoryService,
    private notification: NotificationService,
    private dialogRef: MatDialogRef<CategoryForm>,
    @Inject(MAT_DIALOG_DATA) public data: Category | null
  ) {}
  
  ngOnInit(): void {
    this.isEdit = !!this.data;
  
    this.form = new FormGroup({
      name: new FormControl(this.data?.name ?? '', Validators.required), 
    });
  }

  save(): void {
    if (this.form.invalid) return;

    if (this.isEdit && this.data) {
      // update
      this.categoryService.updateCategory(this.data.id, this.form.value).subscribe({
        next: () => {
          this.dialogRef.close(true);
          this.notification.showInfo(categoryMessages.success.updated.title, categoryMessages.success.updated.message);
        },
        error: (err) => {
          this.notification.showError(categoryMessages.error.updateFailed.title, categoryMessages.error.updateFailed.message);
          console.error(err.error.message);
        }
      });
    } else {
      // create
      this.categoryService.createCategory(this.form.value).subscribe({
        next: () => {
          this.notification.showSuccess(categoryMessages.success.created.title, categoryMessages.success.created.message);
          this.dialogRef.close(true);
        },
        error: (err) => {
          this.notification.showError(categoryMessages.error.createFailed.title, categoryMessages.error.createFailed.message);
          console.error(err.error.message);
        }
      });
    }
  }

  close(): void {
    this.dialogRef.close(false);
  }
}
