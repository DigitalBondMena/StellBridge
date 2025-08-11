import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Contact } from '../../../pages/contact-us/res/contact-us';
import { ContactUsService } from '../../../pages/contact-us/res/contact-us.service';

@Component({
  selector: 'app-footer',
  imports: [RouterLink],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css',
})
export class FooterComponent {
  private contactUs = inject(ContactUsService);

  socialLinks = signal<Contact>({} as Contact);

  ngOnInit(): void {
    this.getSocialLinks();
  }
  getSocialLinks(): void {
    this.contactUs.getContactUs().subscribe((res) => {
      this.socialLinks.set(res.contact);
    });
  }
}
