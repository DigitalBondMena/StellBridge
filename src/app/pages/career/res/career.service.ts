import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BASE_URL } from '../../../core/env';

@Injectable({
  providedIn: 'root'
})
export class CareerService {
  private readonly http = inject(HttpClient);

  getCareerData(): Observable<any> {
    return this.http.get<any>(`https://api.steelbridgeksa.com/api/jop/category`);
  }
  getCareerDetailsData(slug: string): Observable<any> {
    return this.http.get<any>(`https://api.steelbridgeksa.com/api/jop/detail/${slug}`);
  }
  postCareerForm(formData: any): Observable<any> {
    return this.http.post<any>(`https://api.steelbridgeksa.com/api/jop/store`, formData);
  }
}
