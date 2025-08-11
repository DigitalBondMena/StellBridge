import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BASE_URL } from '../../../core/env';
import { IBookCall, IContactUs, IContactUsForm } from './contact-us';


@Injectable({
  providedIn: 'root',
})
export class ContactUsService {
  private http = inject(HttpClient);

  getContactUs(): Observable<IContactUs> {
    return this.http.get<IContactUs>(`${BASE_URL}contact`);
  }
  ContactUsForm(contactUs: IContactUsForm): Observable<any> {

    return this.http.post<any>(
      `https://steel.bondersmena.com/api/contact-us-form/store`,
      contactUs
    );
  }

  bookCall(contactUs: IBookCall): Observable<any> {
    return this.http.post<any>(
      `https://steel.bondersmena.com/api/book-call/store`,
      contactUs
    );
  }

}
