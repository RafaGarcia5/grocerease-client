import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';
import { Product } from '../../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  constructor(private api:ApiService) {}

  private toFormData(data: any): FormData {
    const formData = new FormData();

    Object.keys(data).forEach(key => {
      const value = data[key];

      if (value === null || value === undefined) {
        return;
      }

      if (value instanceof File) {
        formData.append(key, value);
      } else {
        formData.append(key, value);
      }
    });

    return formData;
  }
  
  getProductsByCategory(categoryId: number, page: number = 1, perPage: number = 30, term: string = '') {
    return this.api.get<any>(`product/category/${categoryId}`,{ page, per_page: perPage, q:term });
  }

  getProductById(id: number): Observable<Product> {
    return this.api.get<Product>(`product/${id}`);
  }

  getProductsBySearch(term: string, page: number = 1, perPage: number = 30) {
    return this.api.get<any>('product/search', { q: term, page, per_page: perPage });
  }

  addProduct(product: any): Observable<Product> {
    const formData = this.toFormData(product);
    return this.api.post<Product>('product', formData, true);
  }

  updateProduct(id: number, product: any): Observable<Product> {
    const formData = this.toFormData(product);
    formData.append('_method', 'PUT');  
    return this.api.post<Product>(`product/${id}`, formData, true);
  }
}
