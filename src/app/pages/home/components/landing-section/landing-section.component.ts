import { Component, inject, Input, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Contact } from '../../../contact-us/res/contact-us';
import { ContactUsService } from '../../../contact-us/res/contact-us.service';

@Component({
  selector: 'app-landing-section',
  imports: [],
  templateUrl: './landing-section.component.html',
  styleUrl: './landing-section.component.css',
})
export class LandingSectionComponent {
  @Input({ required: true }) subtitle: string = '';
  @Input({ required: true }) description: string = '';
  @Input({ required: true }) title: string = '';
  @Input({ required: true }) id: string = '';
  @Input({ required: false }) imageUrl: string = '';

  private router = inject(Router);

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

  navigateToSection(fragment: string): void {
    this.router
      .navigate([], {
        fragment,
        replaceUrl: true,
      })
      .then(() => {
        // Add small delay to ensure router's scroll restoration completes first
        setTimeout(() => {
          const element = document.getElementById(fragment);
          if (element) {
            element.scrollIntoView({
              behavior: 'smooth',
              block: 'start',
            });
          }
        }, 0);
      });
  }
}
