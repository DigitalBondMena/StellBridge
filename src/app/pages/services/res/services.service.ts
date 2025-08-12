import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BASE_URL } from '../../../core/env';

import { IService, ServiceResponse } from './services';

@Injectable({
  providedIn: 'root',
})
export class ServicesService {
  private http = inject(HttpClient);

  getServicesData(page: number = 1): Observable<IService> {
    return this.http.get<IService>(`${BASE_URL}services?page=${page}`);
  }

  getServiceDetails(slug: string): Observable<ServiceResponse> {
    return this.http.get<ServiceResponse>(`${BASE_URL}service-detail/${slug}`);
  }
}
