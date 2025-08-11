import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { LibraryLoaderService } from '../../services/library-loader.service';

@Injectable({
  providedIn: 'root',
})
export class PageTransitionsService {
  private platformId = inject(PLATFORM_ID);
  private router = inject(Router);
  private libraryLoader = inject(LibraryLoaderService);

  private isTransitionsEnabled = false;
  private transitionDuration = 0.7; // Animation duration
  private isTransitioning = false;
  private isInitialized = false;
  private pendingNavigation: string | null = null;

  // GSAP instances
  private gsapInstance: any = null;
  private gsapPower2: any = null;
  private gsapExpo: any = null;

  // Transition elements
  private pageTransition?: HTMLElement;
  private preloader?: HTMLElement;
  private overlayTop?: HTMLElement;
  private overlayBottom?: HTMLElement;
  private contentWrap?: HTMLElement;

  constructor() {
    // Don't initialize immediately - wait for proper timing
  }

  /**
   * Initialize page transitions - call this after Angular hydration is complete
   */
  public async initialize(): Promise<void> {
    if (!isPlatformBrowser(this.platformId) || this.isInitialized) {
      return;
    }

    // Load GSAP first
    await this.loadGSAP();

    // Wait for next tick to ensure DOM is fully ready
    setTimeout(() => {
      this.init();
    }, 100);
  }

  /**
   * Load GSAP and its plugins
   */
  private async loadGSAP(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    try {
      const { gsap } = await this.libraryLoader.loadGSAP();
      if (gsap) {
        this.gsapInstance = gsap;

        // Load easing functions
        const Power2 = (gsap as any).Power2 || {
          easeOut: 'power2.out',
          easeInOut: 'power2.inOut',
        };
        const Expo = (gsap as any).Expo || { easeInOut: 'expo.inOut' };

        this.gsapPower2 = Power2;
        this.gsapExpo = Expo;

        console.log('✅ GSAP loaded successfully for page transitions');
      }
    } catch (error) {
      console.error('❌ Failed to load GSAP for page transitions:', error);
    }
  }

  /**
   * Initialize page transitions
   */
  private init(): void {
    if (this.isInitialized) {
      return;
    }

    // Check if transitions are enabled
    this.isTransitionsEnabled =
      document.body.classList.contains('tt-transition');

    if (!this.isTransitionsEnabled) {
      this.isInitialized = true;
      return;
    }

    // Get transition elements
    this.getTransitionElements();

    // Only proceed if we have the required elements
    if (!this.pageTransition) {
      console.log(
        '⚠️ Page transition elements not found, skipping initialization'
      );
      this.isInitialized = true;
      return;
    }

    // Setup word wrapping for caption animations
    this.setupWordWrapping();

    // Setup link click handlers
    this.setupLinkHandlers();

    // Setup router navigation listeners
    this.setupRouterListeners();

    // Setup browser back button handling
    this.setupBrowserHandling();

    // Initial page load animation - delay to avoid hydration conflicts
    setTimeout(() => {
      if (this.gsapInstance) {
        this.animateTransitionOut();
      }
    }, 500);

    this.isInitialized = true;
    console.log('✅ Page transitions initialized');
  }

  /**
   * Get all transition-related DOM elements
   */
  private getTransitionElements(): void {
    this.pageTransition =
      document.getElementById('tt-page-transition') || undefined;
    this.preloader = document.querySelector('.tt-ptr-preloader') || undefined;
    this.overlayTop =
      document.querySelector('.tt-ptr-overlay-top') || undefined;
    this.overlayBottom =
      document.querySelector('.tt-ptr-overlay-bottom') || undefined;
    this.contentWrap = document.getElementById('tt-content-wrap') || undefined;
  }

  /**
   * Setup word wrapping for caption animations (converted from jQuery)
   */
  private setupWordWrapping(): void {
    const captionElements = document.querySelectorAll(
      '.ph-caption-title, .ph-caption-subtitle, .ph-caption-description'
    );

    if (captionElements.length === 0) return;

    captionElements.forEach((element) => {
      // Skip if already processed
      if (element.querySelector('.tt-cap-word-wrap')) {
        return;
      }
      this.wrapWordsAndElements(element);
    });

    // Apply CSS styles (converted from jQuery)
    const wordWraps = document.querySelectorAll('.tt-cap-word-wrap');
    const words = document.querySelectorAll('.tt-cap-word');

    wordWraps.forEach((wrap) => {
      (wrap as HTMLElement).style.display = 'inline-flex';
      (wrap as HTMLElement).style.overflow = 'hidden';
    });

    words.forEach((word) => {
      (word as HTMLElement).style.display = 'inline-block';
      (word as HTMLElement).style.willChange = 'transform';
    });
  }

  /**
   * Wrap words and elements for animation (converted from jQuery logic)
   */
  private wrapWordsAndElements(element: Element): void {
    const childNodes = Array.from(element.childNodes);

    childNodes.forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        // Text node
        const text = node.textContent || '';
        const wrappedText = text.replace(
          /([^\s]+)/g,
          '<span class="tt-cap-word-wrap"><span class="tt-cap-word">$1</span></span>'
        );

        if (wrappedText !== text) {
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = wrappedText;

          while (tempDiv.firstChild) {
            element.insertBefore(tempDiv.firstChild, node);
          }
          element.removeChild(node);
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        // Element node (HTML element)
        const nodeElement = node as HTMLElement;

        // Exclude certain elements from being wrapped
        if (nodeElement.tagName === 'BR' || nodeElement.tagName === 'HR') {
          return;
        }

        // Wrap the HTML element itself
        const wrappedElement = document.createElement('span');
        wrappedElement.className = 'tt-cap-word-wrap';

        const innerSpan = document.createElement('span');
        innerSpan.className = 'tt-cap-word';

        // Clone the current element and append it inside the newly created structure
        innerSpan.appendChild(nodeElement.cloneNode(true));
        wrappedElement.appendChild(innerSpan);

        // Replace the original element with the new wrapped structure
        element.replaceChild(wrappedElement, nodeElement);
      }
    });
  }

  /**
   * Setup link click handlers (converted from jQuery)
   */
  private setupLinkHandlers(): void {
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a') as HTMLAnchorElement;

      if (!link || this.shouldSkipTransition(link)) {
        return;
      }

      // Check if this is an internal Angular route
      if (!this.isInternalRoute(link.href)) {
        return; // Let external links work normally
      }

      e.preventDefault();

      if (this.isTransitioning) {
        return;
      }

      this.triggerPageTransition(link.href);
    });
  }

  /**
   * Check if the URL is an internal Angular route
   */
  private isInternalRoute(url: string): boolean {
    try {
      const linkUrl = new URL(url);
      const currentUrl = new URL(window.location.href);

      // Check if it's the same origin and doesn't have special protocols
      return (
        linkUrl.origin === currentUrl.origin &&
        !linkUrl.href.startsWith('mailto:') &&
        !linkUrl.href.startsWith('tel:') &&
        !linkUrl.href.startsWith('javascript:')
      );
    } catch {
      return false;
    }
  }

  /**
   * Check if link should skip transition (converted from jQuery selectors)
   */
  private shouldSkipTransition(link: HTMLAnchorElement): boolean {
    const skipSelectors = [
      '.no-transition',
      '[target="_blank"]',
      '[href^="#"]',
      '[href^="mailto"]',
      '[href^="tel"]',
      '[data-fancybox]',
      '.tt-btn-disabled',
      '.tt-submenu-trigger > a[href=""]',
      '.ttgr-cat-classic-item a',
      '.ttgr-cat-item a',
    ];

    return skipSelectors.some((selector) => {
      if (selector.startsWith('[') && selector.endsWith(']')) {
        // Attribute selector
        const attr = selector.slice(1, -1);
        if (attr.includes('^=')) {
          const [attrName, attrValue] = attr.split('^=');
          const value = attrValue.replace(/"/g, '');
          return link.getAttribute(attrName)?.startsWith(value) || false;
        } else if (attr.includes('=')) {
          const [attrName, attrValue] = attr.split('=');
          const value = attrValue.replace(/"/g, '');
          return link.getAttribute(attrName) === value;
        } else {
          return link.hasAttribute(attr);
        }
      } else {
        // Class selector
        return link.matches(selector) || link.closest(selector) !== null;
      }
    });
  }

  /**
   * Setup Angular router listeners
   */
  private setupRouterListeners(): void {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        // Only animate out if this was triggered by our transition system
        if (this.pendingNavigation && this.isTransitioning) {
          // Small delay to ensure new content is rendered
          setTimeout(() => {
            this.animateTransitionOut();
            this.pendingNavigation = null;
          }, 50);
        }
      });
  }

  /**
   * Setup browser back button handling
   */
  private setupBrowserHandling(): void {
    window.addEventListener('pageshow', (event) => {
      if (event.persisted) {
        window.location.reload();
      }
    });
  }

  /**
   * Trigger page transition using Angular Router
   */
  private triggerPageTransition(url: string): void {
    this.isTransitioning = true;
    this.pendingNavigation = url;

    // Start the transition in animation
    this.animateTransitionIn();

    // After transition in completes, navigate with Angular Router
    setTimeout(() => {
      try {
        const urlObj = new URL(url);
        const routePath = urlObj.pathname + urlObj.search + urlObj.hash;

        // Navigate using Angular Router
        this.router.navigateByUrl(routePath).catch((error) => {
          console.error('Navigation error:', error);
          this.isTransitioning = false;
          this.pendingNavigation = null;
          // Fallback to direct navigation if router fails
          window.location.href = url;
        });
      } catch (error) {
        console.error('URL parsing error:', error);
        this.isTransitioning = false;
        this.pendingNavigation = null;
        // Fallback to direct navigation if URL parsing fails
        window.location.href = url;
      }
    }, this.transitionDuration * 1000); // Wait for transition in to complete
  }

  /**
   * Animate transition in (page leaving)
   */
  private animateTransitionIn(): void {
    if (!this.gsapInstance || !this.pageTransition) return;

    const tl = this.gsapInstance.timeline({
      defaults: {
        duration: this.transitionDuration,
        ease: this.gsapExpo.easeInOut,
      },
    });

    tl.set(this.pageTransition, { autoAlpha: 1 });

    if (this.contentWrap) {
      tl.to(this.contentWrap, { autoAlpha: 0 }, 0.1);
    }

    if (this.overlayTop) {
      tl.to(this.overlayTop, { scaleX: 1, transformOrigin: 'center left' }, 0);
    }

    if (this.overlayBottom) {
      tl.to(
        this.overlayBottom,
        { scaleX: 1, transformOrigin: 'center right' },
        0
      );
    }

    if (this.preloader) {
      tl.to(this.preloader, { autoAlpha: 1 }, 0.5);
    }
  }

  /**
   * Animate transition out (page entering)
   */
  private animateTransitionOut(): void {
    if (!this.gsapInstance || !this.pageTransition) return;

    const tl = this.gsapInstance.timeline({
      defaults: {
        duration: this.transitionDuration,
        ease: this.gsapExpo.easeInOut,
      },
      onComplete: () => {
        this.isTransitioning = false;
      },
    });

    if (this.preloader) {
      tl.to(this.preloader, { autoAlpha: 0 });
    }

    if (this.overlayTop) {
      tl.to(
        this.overlayTop,
        { scaleX: 0, transformOrigin: 'center left' },
        0.5
      );
    }

    if (this.overlayBottom) {
      tl.to(
        this.overlayBottom,
        { scaleX: 0, transformOrigin: 'center right' },
        0.5
      );
    }

    if (this.contentWrap) {
      tl.from(this.contentWrap, { autoAlpha: 0, clearProps: 'all' }, 0.7);
    }

    // Animate page header elements
    this.animatePageHeaderElements(tl);
  }

  /**
   * Animate page header elements (converted from jQuery)
   */
  private animatePageHeaderElements(timeline: any): void {
    if (!this.gsapInstance) return;

    // Caption title animation
    const captionTitleWords = document.querySelectorAll(
      '.ph-caption-title .tt-cap-word'
    );
    if (captionTitleWords.length) {
      timeline.from(
        captionTitleWords,
        {
          yPercent: 101,
          ease: this.gsapPower2.easeOut,
          clearProps: 'yPercent',
        },
        1.3
      );
    }

    // Caption subtitle animation
    const captionSubtitleWords = document.querySelectorAll(
      '.ph-caption-subtitle .tt-cap-word'
    );
    if (captionSubtitleWords.length) {
      timeline.from(
        captionSubtitleWords,
        {
          yPercent: 101,
          ease: this.gsapPower2.easeOut,
          clearProps: 'yPercent',
        },
        1.8
      );
    }

    // Caption categories animation
    const captionCategories = document.querySelectorAll(
      '.ph-caption-categories'
    );
    if (captionCategories.length) {
      timeline.from(
        captionCategories,
        {
          y: 20,
          autoAlpha: 0,
          ease: this.gsapPower2.easeOut,
          clearProps: 'all',
        },
        1.8
      );
    }

    // Caption description animation
    const captionDescWords = document.querySelectorAll(
      '.ph-caption-description .tt-cap-word'
    );
    if (captionDescWords.length) {
      timeline.from(
        captionDescWords,
        {
          yPercent: 101,
          ease: this.gsapPower2.easeOut,
          clearProps: 'yPercent',
        },
        2.1
      );
    }

    // Caption meta animation
    const captionMeta = document.querySelectorAll('.ph-caption-meta');
    if (captionMeta.length) {
      timeline.from(
        captionMeta,
        {
          y: 20,
          autoAlpha: 0,
          ease: this.gsapPower2.easeOut,
          clearProps: 'all',
        },
        2.1
      );
    }

    // Caption buttons animation
    const captionButtons = document.querySelectorAll('.ph-caption .tt-btn');
    if (captionButtons.length) {
      timeline.from(
        captionButtons,
        {
          y: 20,
          autoAlpha: 0,
          ease: this.gsapPower2.easeOut,
          clearProps: 'all',
        },
        2.5
      );
    }

    // Images and videos animation
    const mediaElements = document.querySelectorAll(
      '.ph-image img, .ph-video video'
    );
    if (mediaElements.length) {
      timeline.from(
        mediaElements,
        {
          duration: 1.2,
          scale: 1.2,
          autoAlpha: 0,
          ease: this.gsapPower2.easeOut,
          clearProps: 'all',
        },
        1
      );
    }

    // Social links animation
    const socialLinks = document.querySelectorAll('.ph-social > ul > li');
    if (socialLinks.length) {
      timeline.from(
        socialLinks,
        {
          y: 40,
          autoAlpha: 0,
          stagger: 0.1,
          ease: this.gsapPower2.easeOut,
          clearProps: 'all',
        },
        1.7
      );
    }

    // Share buttons animation
    const shareButtons = document.querySelectorAll('.ph-share');
    if (shareButtons.length) {
      timeline.from(
        shareButtons,
        {
          y: 40,
          autoAlpha: 0,
          stagger: 0.1,
          ease: this.gsapPower2.easeOut,
          clearProps: 'all',
        },
        1.7
      );
    }

    // Scroll down animation
    const scrollDown = document.querySelectorAll('.tt-scroll-down-inner');
    if (scrollDown.length) {
      timeline.from(
        scrollDown,
        {
          y: 80,
          autoAlpha: 0,
          ease: this.gsapPower2.easeOut,
          clearProps: 'all',
        },
        1.7
      );
    }
  }

  /**
   * Public method to manually trigger transition
   */
  public triggerTransition(url: string): void {
    if (this.isTransitionsEnabled && !this.isTransitioning) {
      this.triggerPageTransition(url);
    } else {
      // Use Angular Router even when transitions are disabled
      try {
        const urlObj = new URL(url, window.location.href);
        const routePath = urlObj.pathname + urlObj.search + urlObj.hash;
        this.router.navigateByUrl(routePath);
      } catch (error) {
        console.error('Navigation error:', error);
        // Only fall back to window.location if URL parsing fails
        window.location.href = url;
      }
    }
  }

  /**
   * Public method to check if transitions are enabled
   */
  get transitionsEnabled(): boolean {
    return this.isTransitionsEnabled;
  }

  /**
   * Public method to check if currently transitioning
   */
  get isInTransition(): boolean {
    return this.isTransitioning;
  }
}
