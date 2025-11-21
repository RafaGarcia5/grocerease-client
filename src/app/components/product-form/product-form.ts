import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormControl, FormGroup, ReactiveFormsModule, Validators, } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { CategoryService } from '../../core/services/category.service';
import { Product } from '../../models/product.model';
import { Category } from '../../models/category.model';

@Component({
  selector: 'app-product-form',
  imports: [
    MatFormFieldModule,
    MatSelectModule,
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatInputModule,
],
  templateUrl: './product-form.html',
  styleUrl: './product-form.css'
})
export class ProductForm implements OnInit {
  form!: FormGroup;
  isEdit = false;
  categories: Category[] = [];

  constructor(private categoryService: CategoryService,
    public dialogRef: MatDialogRef<ProductForm>,
    @Inject(MAT_DIALOG_DATA) public data: { product?: Product }
  ){}
  
  ngOnInit(): void {
    this.isEdit = !!this.data?.product;
  
    this.form = new FormGroup({
      name: new FormControl(this.data?.product?.name ?? '', Validators.required),
      description: new FormControl(this.data?.product?.description ?? '', Validators.required),
      price: new FormControl(this.data?.product?.price ?? 0, [Validators.required, Validators.min(0.1)]),
      stock: new FormControl(this.data?.product?.stock ?? 0, [Validators.required, Validators.min(0)]),
      // image_url: new FormControl(this.data?.product?.image_url ?? ''),
      category_id: new FormControl(this.data?.product?.category_id ?? 0, Validators.required),
      status: new FormControl(this.data?.product?.status ?? 'active', Validators.required),
      image: new FormControl(null),
    });

    this.categoryService.getCategories().subscribe({
      next: data => this.categories = data,
      error: err => console.error('Error loading categories', err)
    });
  }

  onSave(): void {
    if (this.form.valid) {
      const data = {
        ...this.form.value,
        image: this.selectedFile ?? null
      }
      this.dialogRef.close(data);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  selectedFile: File | null = null;

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.form.patchValue({ image: file });
    }
  }
}
