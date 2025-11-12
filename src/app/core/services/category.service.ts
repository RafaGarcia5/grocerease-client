import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';
import { Category } from '../../models/category.model';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  constructor(private api:ApiService) {}

  getCategories(): Observable<Category[]> {
    return this.api.get<Category[]>('category');
  }

  createCategory(data: Partial<Category>) {
    return this.api.post<Category>('category', data);
  }

  updateCategory(id: number, data: Partial<Category>) {
    return this.api.put<Category>(`category/${id}`, data);
  }

}
