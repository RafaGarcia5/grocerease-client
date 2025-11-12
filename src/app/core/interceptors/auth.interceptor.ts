import { HttpEvent, HttpHandlerFn, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, throwError } from 'rxjs';

export function authInterceptor (req: HttpRequest<unknown>, next: HttpHandlerFn) : Observable<HttpEvent<unknown>>{
    const token = localStorage.getItem('token');
    const authReq = token
      ? req.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`
          }
        })
      : req;

    return next(authReq).pipe(
        catchError((error: HttpErrorResponse) => {
            if (error.status === 401) {
                console.warn('Intercepted 401 - Logging out');
                localStorage.removeItem('token'); 
                localStorage.removeItem('user'); 
            }
            return throwError(() => error);
        })
    );
}