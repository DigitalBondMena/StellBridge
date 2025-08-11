import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IPrivacyPolicy } from './privacy-policy';

@Injectable({
  providedIn: 'root',
})
export class PrivacyPolicyService {
  private http = inject(HttpClient);

  getPrivacyPolicy(): Observable<IPrivacyPolicy> {
    return this.http.get<IPrivacyPolicy>(
      `https://steel.bondersmena.com/api/privacy-policy`
    );
  }
}
