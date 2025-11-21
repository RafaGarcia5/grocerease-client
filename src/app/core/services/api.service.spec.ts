import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { ApiService } from './api.service';
import { environment } from '../../../environments/environment';

describe('ApiService', () => {
  let service: ApiService;
  let httpMock: HttpTestingController;

  let baseUrl = environment.apiUrl;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(), 
        ApiService
      ]
    });
    service = TestBed.inject(ApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('when initializing', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });
  });

  describe('when performing GET requests', () => {
    it('should call the correct endpoint with query params', () => {
      const mockResponse = { id: 1, name: 'Test' };
      const params = { search: 'test' };
  
      service.get<any>('items', params).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });
  
      const req = httpMock.expectOne(`${baseUrl}/items?search=test`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('when performing POST requests', () => {
    it('should send data and return response', () => {
      const mockData = { name: 'New Item' };
      const mockResponse = { id: 1, ...mockData };
  
      service.post<any>('items', mockData).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });
  
      const req = httpMock.expectOne(`${baseUrl}/items`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockData);
      req.flush(mockResponse);
    });
  });

  describe('when performing PUT requests', () => {
    it('should update data and return response', () => {
      const mockData = { name: 'Updated' };
      const mockResponse = { id: 1, ...mockData };
  
      service.put<any>('items/1', mockData).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });
      
      const req = httpMock.expectOne(`${baseUrl}/items/1`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(mockData);
      req.flush(mockResponse);
    });
  });

  describe('when performing DELETE requests', () => {
    it('should send DELETE request with body', () => {
      const mockData = { id: 1 };
      const mockResponse = { success: true };
  
      service.delete<any>('items/1', mockData).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });
  
      const req = httpMock.expectOne(`${baseUrl}/items/1`);
      expect(req.request.method).toBe('DELETE');
      expect(req.request.body).toEqual(mockData);
      req.flush(mockResponse);
    });
  
    it('should send DELETE request without body', () => {
      const mockResponse = { success: true };
  
      service.delete<any>('items/1').subscribe(response => {
        expect(response).toEqual(mockResponse);
      });
  
      const req = httpMock.expectOne(`${baseUrl}/items/1`);
      expect(req.request.method).toBe('DELETE');
      expect(req.request.body).toBeNull();
      req.flush(mockResponse);
    });
  });

});
