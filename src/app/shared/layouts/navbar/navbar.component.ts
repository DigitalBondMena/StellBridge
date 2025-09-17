import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  Component,
  HostListener,
  Inject,
  OnInit,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { BookingModalService } from '../../services/booking-modal.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent implements OnInit {
  // Mobile menu state
  isMobileMenuOpen = signal(false);

  // Scroll-based navbar states
  isScrolled = signal(false);
  isNavbarVisible = signal(true);

  // Scroll position tracking
  private lastScrollY = 0;
  private scrollThreshold = 100; // Minimum scroll distance to trigger changes
  private ticking = false;

  // Navigation items (removed Contact since it's handled separately)
  navigationItems = [
    { label: 'Home', route: '/' },
    { label: 'About', route: '/about-us' },
    { label: 'Services', route: '/services' },
    { label: 'Projects', route: '/projects' },
    { label: 'Careers', route: '/career' },
    { label: 'Achievements', route: '/achievements' },
    { label: 'Contact', route: '/contact-us' },
  ];

  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object,
    private bookingModalService: BookingModalService
  ) {}

  // Booking modal methods
  openBookingModal(): void {
    this.bookingModalService.openBookingModal();
  }

  closeBookingModal(): void {
    this.bookingModalService.closeBookingModal();
  }

  ngOnInit(): void {
    // Only initialize scroll position if running in browser
    if (isPlatformBrowser(this.platformId)) {
      this.lastScrollY = window.scrollY;
      this.updateScrollState();
    }
  }

  /**
   * Handle scroll events to show/hide navbar and change background
   */
  @HostListener('window:scroll', ['$event'])
  onScroll(): void {
    // Only handle scroll if running in browser
    if (isPlatformBrowser(this.platformId) && !this.ticking) {
      requestAnimationFrame(() => {
        this.updateScrollState();
        this.ticking = false;
      });
      this.ticking = true;
    }
  }

  /**
   * Update navbar state based on scroll position and direction
   */
  private updateScrollState(): void {
    // Only update scroll state if running in browser
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const currentScrollY = window.scrollY;

    // Check if scrolled beyond threshold
    const scrolled = currentScrollY > this.scrollThreshold;
    this.isScrolled.set(scrolled);

    // Determine navbar visibility based on scroll direction
    if (currentScrollY <= 0) {
      // At the top of the page
      this.isNavbarVisible.set(true);
    } else if (
      currentScrollY > this.lastScrollY &&
      currentScrollY > this.scrollThreshold
    ) {
      // Scrolling down and past threshold - hide navbar
      this.isNavbarVisible.set(false);
    } else if (currentScrollY < this.lastScrollY) {
      // Scrolling up - show navbar
      this.isNavbarVisible.set(true);
    }

    // Update last scroll position
    this.lastScrollY = currentScrollY;
  }

  /**
   * Toggle mobile menu
   */
  toggleMobileMenu(): void {
    this.isMobileMenuOpen.update((value) => !value);

    // Toggle body class for scroll lock (only in browser)
    if (isPlatformBrowser(this.platformId)) {
      if (this.isMobileMenuOpen()) {
        document.body.classList.add('mobile-menu-open');
      } else {
        document.body.classList.remove('mobile-menu-open');
      }
    }
  }

  /**
   * Close mobile menu when navigation item is clicked
   */
  onNavigationClick(): void {
    if (this.isMobileMenuOpen()) {
      this.closeMobileMenu();
    }
  }

  /**
   * Close mobile menu
   */
  closeMobileMenu(): void {
    this.isMobileMenuOpen.set(false);

    // Remove body class (only in browser)
    if (isPlatformBrowser(this.platformId)) {
      document.body.classList.remove('mobile-menu-open');
    }
  }

  /**
   * Handle escape key to close mobile menu
   */
  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    if (this.isMobileMenuOpen()) {
      this.closeMobileMenu();
    }
  }

  /**
   * Close mobile menu when clicking outside
   */
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    // Only handle document clicks in browser
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const target = event.target as HTMLElement;
    const navbar = document.querySelector('.navbar-container');

    if (this.isMobileMenuOpen() && navbar && !navbar.contains(target)) {
      this.closeMobileMenu();
    }
  }

  /**
   * Toggle dark/light theme
   */
  toggleTheme(): void {
    // Only toggle theme in browser
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const body = document.body;
    const isDark = body.classList.contains('tt-dark');

    if (isDark) {
      body.classList.remove('tt-dark');
      body.classList.add('tt-light');
    } else {
      body.classList.remove('tt-light');
      body.classList.add('tt-dark');
    }
  }
}
