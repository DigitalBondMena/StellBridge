import { isPlatformBrowser } from '@angular/common';
import { Component, inject, Inject, PLATFORM_ID, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { SafeHtmlPipe } from '../../core/pipes/safe-html.pipe';
import { LandingSectionComponent } from '../home/components/landing-section/landing-section.component';
import { PrivacyPolicyData } from './res/privacy-policy';
import { PrivacyPolicyService } from './res/privacy-policy.service';

@Component({
  selector: 'app-privacy',
  imports: [LandingSectionComponent, RouterLink, SafeHtmlPipe],
  templateUrl: './privacy.component.html',
  styleUrl: './privacy.component.css',
})
export class PrivacyComponent {
  private router = inject(Router);

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  privacyPolicy = signal<PrivacyPolicyData>({} as PrivacyPolicyData);

  private privacyPolicyService = inject(PrivacyPolicyService);

  ngOnInit(): void {
    this.getPrivacyPolicyData();
  }

  getPrivacyPolicyData() {
    this.privacyPolicyService.getPrivacyPolicy().subscribe((data) => {
      this.privacyPolicy.set(data.date);
      console.log(this.privacyPolicy());
    });
  }

  navigateToSection(fragment: string): void {
    this.router
      .navigate([], {
        fragment,
        replaceUrl: true,
      })
      .then(() => {
        // Only handle DOM manipulation and scrolling in browser
        if (isPlatformBrowser(this.platformId)) {
          // Add small delay to ensure router's scroll restoration completes first
          setTimeout(() => {
            const element = document.getElementById(fragment);
            if (element) {
              const elementTop = element.offsetTop;
              const scrollToPosition = elementTop - window.innerHeight; // 100vh offset

              window.scrollTo({
                top: Math.max(0, scrollToPosition), // Ensure we don't scroll to negative position
                behavior: 'smooth',
              });
            }
          }, 0);
        }
      });
  }
}
