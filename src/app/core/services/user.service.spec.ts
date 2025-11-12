import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { UserService } from './user.service';
import { ApiService } from './api.service';
import { User } from '../../models/auth.model';
import { of, throwError } from 'rxjs';

describe('UserService', () => {
  let service: UserService;
  let apiSpy: jasmine.SpyObj<ApiService>;

  beforeEach(() => {
    const spy = jasmine.createSpyObj('ApiService', ['get', 'put', 'delete']);

    TestBed.configureTestingModule({
      providers: [
        UserService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ApiService, useValue: spy }
      ]
    });

    service = TestBed.inject(UserService);
    apiSpy = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
  });

  describe('when initializing', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });
  });

  describe('getUser', () => {
    it('should get user information', () => {
      const mockUser: User = {
        id: 1,
        name: 'Rafael Garcia',
        email: 'rafa@example.com',
        role: 'customer',
        address: {
          city: 'Puebla',
          state: 'Puebla'
        },
        payment: 'card'
      };
  
      apiSpy.get.and.returnValue(of(mockUser));
  
      service.getUser().subscribe(user => {
        expect(user).toEqual(mockUser);
      });
  
      expect(apiSpy.get).toHaveBeenCalledWith('user');
    });

    it('should handle error when getUser fails', () => {
      const mockError = new Error('Network error');
      apiSpy.get.and.returnValue(throwError(() => mockError));

      service.getUser().subscribe({
        next: () => fail('Expected error, but got success'),
        error: err => expect(err.message).toBe('Network error')
      });

      expect(apiSpy.get).toHaveBeenCalledWith('user');
    });
  });

  describe('updateUser', () => {
    it('should update user information', () => {
      const updatedData = { address: {city: 'CDMX'} };
      const mockUpdatedUser: User = {
        id: 1,
        name: 'Rafael Garcia',
        email: 'rafa@example.com',
        role: 'customer',
        address: {
          city: 'Puebla',
          state: 'CDMX'
        },
        payment: 'cash'
      };
  
      apiSpy.put.and.returnValue(of(mockUpdatedUser));
  
      service.updateUser(1, updatedData).subscribe(user => {
        expect(user).toEqual(mockUpdatedUser);
      });
  
      expect(apiSpy.put).toHaveBeenCalledWith('user/1', updatedData);
    });
  });

  describe('deleteUser', () => {
    it('should delete an account', () => {
      const mockResponse = { message: 'User deleted successfully' };
      apiSpy.delete.and.returnValue(of(mockResponse));
  
      service.delete(5).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });
  
      expect(apiSpy.delete).toHaveBeenCalledWith('user/5');
    });
  });
});
