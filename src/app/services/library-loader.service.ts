import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LibraryLoaderService {
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  /**
   * GSAP - Animation Library
   * ✅ SSR Compatible with dynamic imports
   */
  async loadGSAP() {
    if (!this.isBrowser)
      return { gsap: null, ScrollTrigger: null, ScrollToPlugin: null };

    try {
      const { gsap } = await import('gsap');
      const { ScrollTrigger } = await import('gsap/ScrollTrigger');
      const { ScrollToPlugin } = await import('gsap/ScrollToPlugin');

      gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

      return { gsap, ScrollTrigger, ScrollToPlugin };
    } catch (error) {
      console.error('Failed to load GSAP:', error);
      return { gsap: null, ScrollTrigger: null, ScrollToPlugin: null };
    }
  }

  /**
   * Swiper - Carousel/Slider Library
   * ✅ SSR Compatible with dynamic imports
   */
  async loadSwiper() {
    if (!this.isBrowser) return { Swiper: null, modules: null };

    try {
      const { Swiper } = await import('swiper');
      const { Navigation, Pagination, Autoplay, EffectFade } = await import(
        'swiper/modules'
      );

      return {
        Swiper,
        modules: { Navigation, Pagination, Autoplay, EffectFade },
      };
    } catch (error) {
      console.error('Failed to load Swiper:', error);
      return { Swiper: null, modules: null };
    }
  }

  /**
   * Isotope - Masonry Layout Library
   * ✅ SSR Compatible with dynamic imports
   */
  async loadIsotope() {
    if (!this.isBrowser)
      return { Isotope: null, imagesLoaded: null, Packery: null };

    try {
      const [IsotopeModule, imagesLoadedModule, PackeryModule] =
        await Promise.all([
          import('isotope-layout'),
          import('imagesloaded'),
          import('packery'),
        ]);

      const Isotope = (IsotopeModule as any).default || IsotopeModule;
      const imagesLoaded =
        (imagesLoadedModule as any).default || imagesLoadedModule;
      const Packery = (PackeryModule as any).default || PackeryModule;

      return { Isotope, imagesLoaded, Packery };
    } catch (error) {
      console.error('Failed to load Isotope:', error);
      return { Isotope: null, imagesLoaded: null, Packery: null };
    }
  }

  /**
   * Locomotive Scroll - Smooth Scroll Library
   * ✅ SSR Compatible with dynamic imports
   */
  async loadLocomotiveScroll() {
    if (!this.isBrowser) return null;

    try {
      const LocomotiveScrollModule = await import('locomotive-scroll');
      const LocomotiveScroll =
        (LocomotiveScrollModule as any).default || LocomotiveScrollModule;
      return LocomotiveScroll;
    } catch (error) {
      console.error('Failed to load Locomotive Scroll:', error);
      return null;
    }
  }

  /**
   * Initialize Page Transition Effects
   * ✅ SSR Safe
   */
  async initPageTransitions() {
    if (!this.isBrowser) return;

    const { gsap } = await this.loadGSAP();
    if (!gsap) return;

    const pageTransition = document.getElementById('tt-page-transition');
    if (!pageTransition) return;

    // Page transition animation
    gsap.set(pageTransition, { autoAlpha: 1 });

    const tl = gsap.timeline({
      onComplete: () => {
        gsap.set(pageTransition, { autoAlpha: 0 });
      },
    });

    tl.to('.tt-ptr-overlay-top', {
      duration: 0.8,
      y: '-100%',
      ease: 'power2.inOut',
    })
      .to(
        '.tt-ptr-overlay-bottom',
        { duration: 0.8, y: '100%', ease: 'power2.inOut' },
        '<'
      )
      .to(
        '.tt-ptr-preloader',
        { duration: 0.4, autoAlpha: 0, ease: 'power2.out' },
        '-=0.4'
      );
  }

  /**
   * Initialize Magic Cursor
   * ✅ SSR Safe
   */
  async initMagicCursor() {
    if (!this.isBrowser) return;

    const { gsap } = await this.loadGSAP();
    if (!gsap) return;

    const cursor = document.getElementById('magic-cursor');
    const ball = document.getElementById('ball');

    if (!cursor || !ball) return;

    let mouse = { x: 0, y: 0 };
    let pos = { x: 0, y: 0 };

    gsap.set(ball, { xPercent: -50, yPercent: -50 });

    document.addEventListener('mousemove', (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    });

    gsap.ticker.add(() => {
      const dt = 1.0 - Math.pow(1.0 - 0.18, gsap.ticker.deltaRatio());
      pos.x += (mouse.x - pos.x) * dt;
      pos.y += (mouse.y - pos.y) * dt;
      gsap.set(ball, { x: pos.x, y: pos.y });
    });
  }

  /**
   * Initialize Smooth Scroll
   * ✅ SSR Safe
   */
  async initSmoothScroll() {
    if (!this.isBrowser) return null;

    const LocomotiveScroll = await this.loadLocomotiveScroll();
    if (!LocomotiveScroll) return null;

    try {
      const scroll = new LocomotiveScroll({
        el: document.querySelector('[data-scroll-container]') || document.body,
        smooth: true,
        multiplier: 1,
        class: 'is-revealed',
      });

      return scroll;
    } catch (error) {
      console.error('Failed to initialize Locomotive Scroll:', error);
      return null;
    }
  }

  /**
   * Text Reveal Animation
   * ✅ SSR Safe
   */
  async initTextReveal() {
    if (!this.isBrowser) return;

    const { gsap, ScrollTrigger } = await this.loadGSAP();
    if (!gsap || !ScrollTrigger) return;

    const textElements = document.querySelectorAll('.tt-text-reveal');

    textElements.forEach((element) => {
      gsap.fromTo(
        element,
        {
          opacity: 0,
          y: 50,
        },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: element,
            start: 'top 80%',
            end: 'bottom 20%',
            toggleActions: 'play none none none',
          },
        }
      );
    });
  }

  /**
   * Initialize Fancybox Lightbox (Alternative Solution)
   * ✅ SSR Safe - Using Angular CDK Overlay instead
   */
  async initLightbox() {
    if (!this.isBrowser) return;

    // Initialize click handlers for lightbox elements
    const lightboxElements = document.querySelectorAll('[data-fancybox]');

    lightboxElements.forEach((element) => {
      element.addEventListener('click', (e) => {
        e.preventDefault();
        const href = (element as HTMLElement).getAttribute('href');

        if (href) {
          // Create simple lightbox overlay
          this.createSimpleLightbox(href);
        }
      });
    });
  }

  /**
   * Create Simple Lightbox (Replaces Fancybox)
   */
  private createSimpleLightbox(src: string) {
    const overlay = document.createElement('div');
    overlay.className = 'lightbox-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.9);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      cursor: pointer;
    `;

    const content = document.createElement('div');
    content.style.cssText = 'max-width: 90%; max-height: 90%;';

    if (src.includes('youtube.com') || src.includes('vimeo.com')) {
      const iframe = document.createElement('iframe');
      iframe.src = src;
      iframe.style.cssText = 'width: 80vw; height: 45vw; border: none;';
      content.appendChild(iframe);
    } else {
      const img = document.createElement('img');
      img.src = src;
      img.style.cssText =
        'max-width: 100%; max-height: 100%; object-fit: contain;';
      content.appendChild(img);
    }

    overlay.appendChild(content);
    document.body.appendChild(overlay);

    // Close on click
    overlay.addEventListener('click', () => {
      document.body.removeChild(overlay);
    });
  }
}
