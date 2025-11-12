import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ApiService } from './api.service';
import { LoginResponse, LogoutResponse, User } from '../../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class Auth {
  private userSubject = new BehaviorSubject<User | null>(null);
  constructor(private api: ApiService) {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if(token){
      if(storedUser){
        this.userSubject.next(JSON.parse(storedUser));
      }else{
        this.fetchCurrentUser().subscribe({
          next: res => {
            this.userSubject.next(res);
            localStorage.setItem('user', JSON.stringify(res));
          },
          error: (e) => {
            this.userSubject.next(null);
          } 
        });
      }
    }
  }

  get user$() {
    return this.userSubject.asObservable();
  }

  get currentUser(): User | null {
    return this.userSubject.value;
  }

  get isAuthenticated(): boolean {
    return !!this.userSubject.value;
  }
  
  isVendor(): boolean {
    return this.userSubject.value?.role === 'vendor';
  }

  register(userData: any) {
    return this.api.post<LoginResponse>('register', userData);
  }

  login(credentials: any) {
    return  this.api.post<LoginResponse>('login', credentials);
  }

  logout() {
    return this.api.post<LogoutResponse>('logout', {});
  }

  fetchCurrentUser() { 
    return this.api.get<User>('user'); 
  }
  
  handleAuthSuccess(res: LoginResponse) { 
    if (res.token) { 
      localStorage.setItem('token', res.token); 
      localStorage.setItem('user', JSON.stringify(res.user)); 
      this.userSubject.next(res.user); 
    } 
  }

  clearSession() { 
    localStorage.removeItem('token'); 
    localStorage.removeItem('user'); 
    this.userSubject.next(null); 
  }

  updateUser(updatedUser: User) { 
    localStorage.setItem('user', JSON.stringify(updatedUser)); 
    this.userSubject.next(updatedUser); 
  }
}
