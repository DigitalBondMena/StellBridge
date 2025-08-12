import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BASE_URL } from '../../../core/env';
import { IAchievements } from './achievements';

@Injectable({
  providedIn: 'root',
})
export class AchievementsService {
  private http = inject(HttpClient);

  getAchievements(page: number = 1): Observable<IAchievements> {
    return this.http.get<IAchievements>(`${BASE_URL}achievements?page=${page}`);
  }
}
