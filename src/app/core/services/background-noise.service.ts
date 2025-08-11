import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class BackgroundNoiseService {
  private platformId = inject(PLATFORM_ID);
  private isInitialized = false;

  constructor() {
    // Don't initialize immediately - wait for proper timing
  }

  /**
   * Initialize background noise - call this after Angular hydration is complete
   */
  public initialize(): void {
    if (!isPlatformBrowser(this.platformId) || this.isInitialized) {
      return;
    }

    // Wait for next tick to ensure DOM is fully ready
    setTimeout(() => {
      this.init();
    }, 100);
  }

  /**
   * Initialize background noise effect
   * Converted from: if ($("body").hasClass("tt-noise")) { ... }
   */
  private init(): void {
    if (this.isInitialized) {
      return;
    }

    if (!document.body.classList.contains('tt-noise')) {
      this.isInitialized = true;
      return;
    }

    // Find all elements with tt-noise class
    const noiseElements = document.querySelectorAll('.tt-noise');

    noiseElements.forEach((element) => {
      this.addNoiseElement(element);
    });

    this.isInitialized = true;

    if (noiseElements.length > 0) {
      console.log('✅ Background noise initialized');
    }
  }

  /**
   * Add noise div to element
   * Converted from: $(this).prepend('<div class="tt-bg-noise"></div>');
   */
  private addNoiseElement(element: Element): void {
    // Check if noise element already exists
    if (element.querySelector('.tt-bg-noise')) {
      return;
    }

    // Create noise element
    const noiseDiv = document.createElement('div');
    noiseDiv.className = 'tt-bg-noise';

    // Prepend to element (add as first child)
    element.insertAdjacentElement('afterbegin', noiseDiv);
  }

  /**
   * Public method to add noise to specific element
   */
  public addNoiseTo(selector: string): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const elements = document.querySelectorAll(selector);
    elements.forEach((element) => {
      element.classList.add('tt-noise');
      this.addNoiseElement(element);
    });
  }

  /**
   * Public method to remove noise from specific element
   */
  public removeNoiseFrom(selector: string): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const elements = document.querySelectorAll(selector);
    elements.forEach((element) => {
      element.classList.remove('tt-noise');
      const noiseDiv = element.querySelector('.tt-bg-noise');
      if (noiseDiv) {
        noiseDiv.remove();
      }
    });
  }

  /**
   * Public method to toggle noise effect
   */
  public toggleBodyNoise(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const body = document.body;

    if (body.classList.contains('tt-noise')) {
      this.removeNoiseFrom('body');
    } else {
      this.addNoiseTo('body');
    }
  }
}
