import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BASE_URL } from '../../../core/env';
import { IHome } from './home';

@Injectable({
  providedIn: 'root',
})
export class HomeService {
  private http = inject(HttpClient);

  getHomeData(): Observable<IHome> {
    return this.http.get<IHome>(`${BASE_URL}home`);
  }
}
