import { NgOptimizedImage } from '@angular/common';
import { Component, inject, input, Renderer2, signal } from '@angular/core';
import { Router } from '@angular/router';
import { IMAGE_BASE_URL } from '../../../../core/env';
import { Contact } from '../../../contact-us/res/contact-us';
import { ContactUsService } from '../../../contact-us/res/contact-us.service';
import { Slider } from '../../res/home';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [NgOptimizedImage],
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.css',
})
export class HeroComponent {
  private renderer = inject(Renderer2);

  private router = inject(Router);

  private contactUs = inject(ContactUsService);

  slider = input<Slider>();

  socialLinks = signal<Contact>({} as Contact);

  imageUrl = IMAGE_BASE_URL;

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

  onMouseEnter(): void {
    this.renderer.addClass(document.body, 'ph-mask-active');
  }

  onMouseLeave(): void {
    this.renderer.removeClass(document.body, 'ph-mask-active');
  }
}
