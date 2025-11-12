import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';
import { Product } from '../../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  constructor(private api:ApiService) {}
  
  getProductsByCategory(categoryId: number, page: number = 1, perPage: number = 30, term: string = '') {
    return this.api.get<any>(`product/category/${categoryId}`,{ page, per_page: perPage, q:term });
  }

  getProductById(id: number): Observable<Product> {
    return this.api.get<Product>(`product/${id}`);
  }

  getProductsBySearch(term: string, page: number = 1, perPage: number = 30) {
    return this.api.get<any>('product/search', { q: term, page, per_page: perPage });
  }

  addProduct(product: Partial<Product>): Observable<Product> {
    return this.api.post<Product>('product', product);
  }

  updateProduct(id: number, product: Partial<Product>): Observable<Product> {
    return this.api.put<Product>(`product/${id}`, product);
  }
}
