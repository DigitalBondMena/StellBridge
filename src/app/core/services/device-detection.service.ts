import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class DeviceDetectionService {
  private platformId = inject(PLATFORM_ID);
  private _isMobile = false;
  private _isTouch = false;

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.detectTouchDevice();
      this.addBodyClasses();
    }
  }

  /**
   * Detect touch device (converted from original theme.js)
   * Info: https://developer.mozilla.org/en-US/docs/Web/HTTP/Browser_detection_using_the_user_agent#mobile_device_detection
   */
  private detectTouchDevice(): void {
    if ('maxTouchPoints' in navigator) {
      this._isMobile = navigator.maxTouchPoints > 0;
    } else if ('msMaxTouchPoints' in (navigator as any)) {
      this._isMobile = (navigator as any).msMaxTouchPoints > 0;
    } else {
      const mQ = matchMedia?.('(pointer:coarse)');
      if (mQ?.media === '(pointer:coarse)') {
        this._isMobile = !!mQ.matches;
      } else if ('orientation' in window) {
        this._isMobile = true; // deprecated, but good fallback
      } else {
        // Only as a last resort, fall back to user agent sniffing
        this._isMobile =
          /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Nokia|Opera Mini|Tablet|Mobile/i.test(
            (navigator as any).userAgent || ''
          );
      }
    }

    this._isTouch = this._isMobile;
  }

  /**
   * Add classes to body element
   */
  private addBodyClasses(): void {
    if (this._isMobile) {
      document.body.classList.add('is-mobile');
    }
  }

  /**
   * Check if device is mobile/touch
   */
  get isMobile(): boolean {
    return this._isMobile;
  }

  /**
   * Check if device supports touch
   */
  get isTouch(): boolean {
    return this._isTouch;
  }

  /**
   * Check if device is desktop
   */
  get isDesktop(): boolean {
    return !this._isMobile;
  }

  /**
   * Get device type as string
   */
  get deviceType(): 'mobile' | 'desktop' {
    return this._isMobile ? 'mobile' : 'desktop';
  }

  /**
   * Check if screen width is below certain breakpoint
   */
  isScreenBelow(breakpoint: number): boolean {
    if (!isPlatformBrowser(this.platformId)) {
      return false;
    }
    return window.innerWidth < breakpoint;
  }

  /**
   * Check if screen width is above certain breakpoint
   */
  isScreenAbove(breakpoint: number): boolean {
    if (!isPlatformBrowser(this.platformId)) {
      return true; // Assume desktop for SSR
    }
    return window.innerWidth >= breakpoint;
  }

  /**
   * Common breakpoints
   */
  get breakpoints() {
    return {
      mobile: 768,
      tablet: 992,
      desktop: 1200,
      large: 1400,
    };
  }

  /**
   * Check if mobile menu should be active (from original)
   */
  get isMobileMenuActive(): boolean {
    if (!isPlatformBrowser(this.platformId)) {
      return false;
    }
    return window.matchMedia('(max-width: 1024px)').matches;
  }
}
