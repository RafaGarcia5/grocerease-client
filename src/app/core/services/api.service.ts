import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../enviroments/enviroment';

@Injectable({
    providedIn: 'root'
})
export class ApiService {
    private baseUrl = environment.baseUrl;
    constructor(private http: HttpClient) {}

    get<T>(url: string, params?: any): Observable<T> {
        return this.http.get<T>(`${this.baseUrl}/${url}`, { params });
    }

    post<T>(url: string, data: any): Observable<T> {
        return this.http.post<T>(`${this.baseUrl}/${url}`, data);
    }

    put<T>(url: string, data: any): Observable<T> {
        return this.http.put<T>(`${this.baseUrl}/${url}`, data);
    }

    delete<T>(url: string, data?: any): Observable<T> {
        return this.http.request<T>('delete', `${this.baseUrl}/${url}`, {
          body: data
        });
    }
}
