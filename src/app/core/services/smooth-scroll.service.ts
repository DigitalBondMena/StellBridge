import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';

interface ScrollOptions {
  duration?: number;
  easing?: string;
  offset?: number;
  callback?: () => void;
}

@Injectable({
  providedIn: 'root',
})
export class SmoothScrollService {
  private isEnabled = true;
  private isInitialized = false;
  private scrollOffset = 0;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    if (isPlatformBrowser(this.platformId)) {
      this.init();
    }
  }

  /**
   * Initialize smooth scroll with native CSS scroll-behavior
   */
  init(): void {
    if (this.isInitialized || !isPlatformBrowser(this.platformId)) {
      return;
    }

    try {
      // Apply smooth scroll behavior to html element
      document.documentElement.style.scrollBehavior = 'smooth';

      // Set initialized flag
      this.isInitialized = true;
      console.log('✅ Native smooth scroll initialized');
    } catch (error) {
      console.error('❌ Error initializing smooth scroll:', error);
    }
  }

  /**
   * Scroll to target element or position
   */
  scrollTo(
    target: string | number | Element,
    options: ScrollOptions = {}
  ): void {
    if (!isPlatformBrowser(this.platformId) || !this.isEnabled) {
      console.warn('⚠️ Smooth scroll is disabled or not available');
      return;
    }

    const { offset = 0, callback } = options;

    try {
      if (typeof target === 'number') {
        // Scroll to specific position
        window.scrollTo({
          top: target + offset,
          behavior: 'smooth',
        });
      } else if (typeof target === 'string') {
        // Scroll to element by selector
        const element = document.querySelector(target);
        if (element) {
          const elementPosition =
            element.getBoundingClientRect().top + window.scrollY;
          window.scrollTo({
            top: elementPosition + offset,
            behavior: 'smooth',
          });
        } else {
          console.warn(`⚠️ Element not found: ${target}`);
        }
      } else if (target instanceof Element) {
        // Scroll to element directly
        const elementPosition =
          target.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({
          top: elementPosition + offset,
          behavior: 'smooth',
        });
      }

      // Execute callback after scroll
      if (callback) {
        setTimeout(callback, 600); // Approximate scroll duration
      }
    } catch (error) {
      console.error('❌ Error during scroll:', error);
    }
  }

  /**
   * Stop smooth scrolling (disable smooth behavior)
   */
  stop(): void {
    if (isPlatformBrowser(this.platformId)) {
      document.documentElement.style.scrollBehavior = 'auto';
      this.isEnabled = false;
    }
  }

  /**
   * Start smooth scrolling (enable smooth behavior)
   */
  start(): void {
    if (isPlatformBrowser(this.platformId)) {
      document.documentElement.style.scrollBehavior = 'smooth';
      this.isEnabled = true;
    }
  }

  /**
   * Destroy smooth scroll (reset to default)
   */
  destroy(): void {
    if (isPlatformBrowser(this.platformId)) {
      document.documentElement.style.scrollBehavior = '';
      this.isEnabled = false;
      this.isInitialized = false;
    }
  }

  /**
   * Get current scroll position
   */
  getScrollY(): number {
    return isPlatformBrowser(this.platformId) ? window.scrollY : 0;
  }

  /**
   * Check if smooth scroll is enabled
   */
  isScrollEnabled(): boolean {
    return this.isEnabled && this.isInitialized;
  }

  /**
   * Set scroll offset for navigation
   */
  setScrollOffset(offset: number): void {
    this.scrollOffset = offset;
  }

  /**
   * Get scroll offset
   */
  getScrollOffset(): number {
    return this.scrollOffset;
  }
}
