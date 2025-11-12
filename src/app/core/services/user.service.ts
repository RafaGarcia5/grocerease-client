import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { User } from '../../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(private api: ApiService) {}

  getUser() {
    return this.api.get<User>('user');
  }

  updateUser(id: number, data: Partial<User>) {
    return this.api.put<User>(`user/${id}`, data);
  }

  delete(id: number) {
    return this.api.delete<{ message: string }>(`user/${id}`);
  }
}
