import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  inject,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  ViewChild,
} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NgxSpinnerModule } from 'ngx-spinner';
import { BackgroundNoiseService } from './core/services/background-noise.service';
import { DeviceDetectionService } from './core/services/device-detection.service';
import { IsotopeService } from './core/services/isotope.service';
import { MagicCursorService } from './core/services/magic-cursor.service';
import { PageTransitionsService } from './core/services/page-transitions.service';
import { SmoothScrollService } from './core/services/smooth-scroll.service';
import { SwipersService } from './core/services/swipers.service';
import { ThemeService } from './core/services/theme.service';
import { LibraryLoaderService } from './services/library-loader.service';
import { LatsConnectComponent } from './shared/components/lats-connect/lats-connect.component';
import { FooterComponent } from './shared/layouts/footer/footer.component';
import { NavbarComponent } from './shared/layouts/navbar/navbar.component';
import { isFoundingDay } from './core/env';
import { FoundingDayFloadingCircleComponent } from './shared/components/founding-day-floading-circle/founding-day-floading-circle.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    NavbarComponent,
    FooterComponent,
    LatsConnectComponent,
    NgxSpinnerModule,
    FoundingDayFloadingCircleComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit, AfterViewInit, OnDestroy {
  title = 'stellBridge';
  isFoundingDay = isFoundingDay;
  private libraryLoader = inject(LibraryLoaderService);
  private platformId = inject(PLATFORM_ID);
  private cdr = inject(ChangeDetectorRef);
  private isLibrariesInitialized = false;

  // Core services
  private deviceService = inject(DeviceDetectionService);
  private pageTransitionsService = inject(PageTransitionsService);
  private backgroundNoiseService = inject(BackgroundNoiseService);
  private smoothScrollService = inject(SmoothScrollService);
  private themeService = inject(ThemeService);

  // Advanced services
  private isotopeService = inject(IsotopeService);
  private magicCursorService = inject(MagicCursorService);
  private swipersService = inject(SwipersService);

  // Performance optimization: Cache DOM elements
  private styleSwitch: HTMLElement | null = null;
  private magneticElements: NodeListOf<Element> | null = null;
  private scrollToTopBtn: HTMLElement | null = null;
  private progressPath: SVGPathElement | null = null;

  // Performance optimization: Debounce scroll events
  private scrollTimeout: any;
  private readonly SCROLL_DEBOUNCE = 16; // ~60fps

  ngOnInit() {
    this.initFoundingDay();
    if (isPlatformBrowser(this.platformId)) {
      // Use requestIdleCallback for non-critical initialization
      if ('requestIdleCallback' in window) {
        (window as any).requestIdleCallback(() => {
          this.initializeCriticalLibraries();
        });
      } else {
        // Fallback for older browsers
        setTimeout(() => {
          this.initializeCriticalLibraries();
        }, 100);
      }
    }
  }

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      // Cache DOM elements once
      this.cacheDOMElements();

      // Use requestIdleCallback for view-dependent libraries
      if ('requestIdleCallback' in window) {
        (window as any).requestIdleCallback(() => {
          this.initializeViewLibraries();
        });
      } else {
        setTimeout(() => {
          this.initializeViewLibraries();
        }, 200);
      }

      // Initialize services in parallel
      this.initializeConvertedServices();

      this.isLibrariesInitialized = true;
      this.dispatchLibrariesReadyEvent();

      // Initialize scroll-to-top with cached elements
      this.initializeScrollToTop();
    }
  }

  ngOnDestroy() {
    if (isPlatformBrowser(this.platformId)) {
      this.cleanupLibraries();
    }
  }
  private initFoundingDay() {
    if (isFoundingDay) {
      document.body.classList.add('founding-day');
    }
  }
  /**
   * Cache DOM elements to avoid repeated queries
   */
  private cacheDOMElements(): void {
    this.styleSwitch = document.querySelector('.tt-style-switch');
    this.magneticElements = document.querySelectorAll('.tt-magnetic-item');
    this.scrollToTopBtn = document.querySelector('.tt-scroll-to-top');
    this.progressPath = document.querySelector(
      '.tt-stt-progress path',
    ) as SVGPathElement;
  }

  /**
   * Initialize libraries that don't depend on DOM elements
   */
  private async initializeCriticalLibraries() {
    try {
      // Load libraries in parallel instead of sequentially
      const [gsapResult, swiperResult, isotopeResult] =
        await Promise.allSettled([
          this.libraryLoader.loadGSAP(),
          this.libraryLoader.loadSwiper(),
          this.libraryLoader.loadIsotope(),
        ]);

      // Handle results individually
      if (gsapResult.status === 'fulfilled') {
        console.log('✅ GSAP loaded successfully');
      }
      if (swiperResult.status === 'fulfilled') {
        console.log('✅ Swiper loaded successfully');
      }
      if (isotopeResult.status === 'fulfilled') {
        console.log('✅ Isotope loaded successfully');
      }
    } catch (error) {
      console.warn('⚠️ Some libraries failed to load:', error);
    }
  }

  /**
   * Initialize libraries that depend on DOM elements
   */
  private async initializeViewLibraries() {
    try {
      // Initialize non-critical features in parallel
      const initPromises = [
        this.libraryLoader.initPageTransitions(),
        this.libraryLoader.initMagicCursor(),
        this.libraryLoader.initTextReveal(),
      ];

      // Wait for all to complete
      await Promise.allSettled(initPromises);

      // Initialize UI features
      this.initStyleSwitcher();
      this.initMagneticElements();
    } catch (error) {
      console.warn('⚠️ Some view libraries failed to initialize:', error);
    }
  }

  /**
   * Initialize style switcher functionality (optimized)
   */
  private async initStyleSwitcher() {
    if (!isPlatformBrowser(this.platformId) || !this.styleSwitch) return;

    const { gsap } = await this.libraryLoader.loadGSAP();
    if (!gsap) return;

    // Remove existing listeners to prevent duplicates
    this.styleSwitch.removeEventListener('click', this.handleStyleSwitch);

    // Add new listener
    this.styleSwitch.addEventListener(
      'click',
      this.handleStyleSwitch.bind(this),
    );

    // Animate the switch
    gsap.to(this.styleSwitch, {
      rotation: 360,
      duration: 0.5,
      ease: 'power2.out',
    });
  }

  /**
   * Handle style switching (bound method for proper cleanup)
   */
  private handleStyleSwitch() {
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

  /**
   * Initialize magnetic elements effect (optimized)
   */
  private async initMagneticElements() {
    if (!isPlatformBrowser(this.platformId) || !this.magneticElements) return;

    const { gsap } = await this.libraryLoader.loadGSAP();
    if (!gsap) return;

    this.magneticElements.forEach((element: any) => {
      // Remove existing listeners
      element.removeEventListener('mousemove', element._magneticMouseMove);
      element.removeEventListener('mouseleave', element._magneticMouseLeave);

      // Create bound event handlers
      element._magneticMouseMove = (e: MouseEvent) => {
        const rect = element.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;

        gsap.to(element, {
          x: x * 0.3,
          y: y * 0.3,
          duration: 0.3,
          ease: 'power2.out',
        });
      };

      element._magneticMouseLeave = () => {
        gsap.to(element, {
          x: 0,
          y: 0,
          duration: 0.3,
          ease: 'power2.out',
        });
      };

      // Add new listeners
      element.addEventListener('mousemove', element._magneticMouseMove);
      element.addEventListener('mouseleave', element._magneticMouseLeave);
    });
  }

  /**
   * Initialize our converted services after hydration is complete
   */
  private async initializeConvertedServices(): Promise<void> {
    try {
      console.log('🚀 Step 4: Initializing Advanced Angular Services...');

      // Initialize services in parallel for better performance
      const servicePromises = [
        this.pageTransitionsService.initialize(),
        this.magicCursorService.initialize(),
        this.swipersService.initialize(),
      ];

      // Wait for all services to initialize
      await Promise.allSettled(servicePromises);

      // Initialize synchronous services
      this.backgroundNoiseService.initialize();
      this.smoothScrollService.init();
      await this.themeService.initialize();

      console.log('✅ All services initialized successfully');
    } catch (error) {
      console.error('❌ Error initializing converted services:', error);
    }
  }

  /**
   * Dispatch event to notify components that libraries are ready
   */
  private dispatchLibrariesReadyEvent() {
    if (!isPlatformBrowser(this.platformId)) return;

    const event = new CustomEvent('librariesReady', {
      detail: {
        isReady: true,
        availableLibraries: [
          'gsap',
          'swiper',
          'isotope',
          'imagesloaded',
          'packery',
        ],
      },
    });

    window.dispatchEvent(event);
  }

  /**
   * Cleanup libraries on component destroy
   */
  private cleanupLibraries() {
    if (!isPlatformBrowser(this.platformId)) return;

    // Cleanup smooth scroll
    if (this.smoothScrollService) {
      this.smoothScrollService.destroy();
    }

    // Cleanup theme service
    if (this.themeService) {
      this.themeService.destroy();
    }

    // Cleanup advanced services
    if (this.isotopeService) {
      this.isotopeService.destroy();
    }

    if (this.magicCursorService) {
      this.magicCursorService.destroy();
    }

    if (this.swipersService) {
      this.swipersService.destroy();
    }

    // Cleanup event listeners properly
    if (this.styleSwitch) {
      this.styleSwitch.removeEventListener('click', this.handleStyleSwitch);
    }

    if (this.magneticElements) {
      this.magneticElements.forEach((element: any) => {
        if (element._magneticMouseMove) {
          element.removeEventListener('mousemove', element._magneticMouseMove);
        }
        if (element._magneticMouseLeave) {
          element.removeEventListener(
            'mouseleave',
            element._magneticMouseLeave,
          );
        }
      });
    }

    // Clear scroll timeout
    if (this.scrollTimeout) {
      clearTimeout(this.scrollTimeout);
    }
  }

  /**
   * Public method to check if libraries are ready
   */
  get areLibrariesReady(): boolean {
    return this.isLibrariesInitialized;
  }

  /**
   * Public method to get library loader service
   */
  get libraryService() {
    return this.libraryLoader;
  }

  // Scroll to top button
  @ViewChild('scrollToTopButton', { static: false })
  scrollToTopButton!: ElementRef;

  ttSttOffset = 150;
  ttSttPathLength!: number;

  constructor() {}

  @HostListener('window:scroll', [])
  onWindowScroll() {
    if (isPlatformBrowser(this.platformId)) {
      // Debounce scroll events for better performance
      if (this.scrollTimeout) {
        clearTimeout(this.scrollTimeout);
      }

      this.scrollTimeout = setTimeout(() => {
        this.updateButtonVisibility();
        this.updateProgress();
      }, this.SCROLL_DEBOUNCE);
    }
  }

  updateButtonVisibility() {
    if (!isPlatformBrowser(this.platformId) || !this.scrollToTopBtn) return;

    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    if (scrollTop > this.ttSttOffset) {
      this.scrollToTopBtn.classList.add('tt-stt-active');
    } else {
      this.scrollToTopBtn.classList.remove('tt-stt-active');
    }
  }

  updateProgress() {
    if (!isPlatformBrowser(this.platformId) || !this.progressPath) return;

    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const docHeight =
      document.documentElement.scrollHeight - window.innerHeight;
    const progress =
      this.ttSttPathLength - (scrollTop * this.ttSttPathLength) / docHeight;

    this.progressPath.style.strokeDashoffset = `${progress}`;
  }

  scrollToTop(event: Event) {
    event.preventDefault();

    // Use smooth scroll if available, fallback to custom animation
    if ('scrollBehavior' in document.documentElement.style) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Custom smooth scroll fallback
    const duration = 800;
    const start = window.scrollY;
    const startTime = performance.now();

    const easeInOutQuart = (
      time: number,
      from: number,
      distance: number,
      duration: number,
    ) => {
      time /= duration / 2;
      if (time < 1) return (distance / 2) * time * time * time * time + from;
      time -= 2;
      return (-distance / 2) * (time * time * time * time - 2) + from;
    };

    const animateScroll = (currentTime: number) => {
      const timeElapsed = currentTime - startTime;
      const run = easeInOutQuart(timeElapsed, start, -start, duration);
      window.scrollTo(0, run);
      if (timeElapsed < duration) {
        requestAnimationFrame(animateScroll);
      }
    };

    requestAnimationFrame(animateScroll);
  }

  /**
   * Initialize scroll-to-top button functionality (optimized)
   */
  private initializeScrollToTop(): void {
    if (!this.progressPath) return;

    this.ttSttPathLength = this.progressPath.getTotalLength();

    this.progressPath.style.transition = 'none';
    this.progressPath.style.strokeDasharray = `${this.ttSttPathLength} ${this.ttSttPathLength}`;
    this.progressPath.style.strokeDashoffset = `${this.ttSttPathLength}`;
    this.progressPath.style.transition = 'stroke-dashoffset 10ms linear';

    this.updateButtonVisibility();
    this.updateProgress();
  }
}
