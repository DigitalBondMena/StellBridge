import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BASE_URL } from '../../../core/env';
import { IAbout } from './about';

@Injectable({
  providedIn: 'root',
})
export class AboutService {
  private http = inject(HttpClient);

  getAboutData(): Observable<IAbout> {
    return this.http.get<IAbout>(`${BASE_URL}about`);
  }
}
