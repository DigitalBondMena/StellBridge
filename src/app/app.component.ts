import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
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
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit, AfterViewInit, OnDestroy {
  title = 'stellBridge';

  private libraryLoader = inject(LibraryLoaderService);
  private platformId = inject(PLATFORM_ID);
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

  ngOnInit() {
    // Only initialize in browser
    if (isPlatformBrowser(this.platformId)) {
      // Initialize critical libraries that need early setup
      this.initializeCriticalLibraries();
    }
  }

  ngAfterViewInit() {
    // Only initialize in browser
    if (isPlatformBrowser(this.platformId)) {
      // Initialize view-dependent libraries after DOM is ready
      this.initializeViewLibraries();

      // Initialize our converted services after hydration is complete
      this.initializeConvertedServices();

      // Mark libraries as initialized
      this.isLibrariesInitialized = true;

      // Dispatch custom event to notify components that libraries are ready
      this.dispatchLibrariesReadyEvent();

      // Initialize scroll-to-top button (MOVED INSIDE BROWSER CHECK)
      this.initializeScrollToTop();
    }
  }

  ngOnDestroy() {
    // Only cleanup in browser
    if (isPlatformBrowser(this.platformId)) {
      this.cleanupLibraries();
    }
  }

  /**
   * Initialize libraries that don't depend on DOM elements
   */
  private async initializeCriticalLibraries() {
    try {
      // Pre-load GSAP for immediate availability
      await this.libraryLoader.loadGSAP();
      console.log('✅ GSAP loaded and ready');

      // Pre-load Swiper
      await this.libraryLoader.loadSwiper();
      console.log('✅ Swiper loaded and ready');

      // Pre-load Isotope
      await this.libraryLoader.loadIsotope();
      console.log('✅ Isotope loaded and ready');
    } catch (error) {
      console.error('❌ Error loading critical libraries:', error);
    }
  }

  /**
   * Initialize libraries that depend on DOM elements
   */
  private async initializeViewLibraries() {
    try {
      // Initialize page transitions
      await this.libraryLoader.initPageTransitions();
      console.log('✅ Page transitions initialized');

      // Initialize magic cursor
      await this.libraryLoader.initMagicCursor();
      console.log('✅ Magic cursor initialized');

      // Initialize text reveal animations
      await this.libraryLoader.initTextReveal();
      console.log('✅ Text reveal animations initialized');

      // Initialize style switcher (light/dark mode)
      this.initStyleSwitcher();

      // Initialize magnetic elements
      this.initMagneticElements();

      // Initialize scroll to top button
    } catch (error) {
      console.error('❌ Error loading view libraries:', error);
    }
  }

  /**
   * Initialize style switcher functionality (replaces jQuery)
   */
  private async initStyleSwitcher() {
    if (!isPlatformBrowser(this.platformId)) return;

    const { gsap } = await this.libraryLoader.loadGSAP();
    if (!gsap) return;

    const styleSwitch = document.querySelector('.tt-style-switch');
    if (!styleSwitch) return;

    styleSwitch.addEventListener('click', () => {
      const body = document.body;
      const isDark = body.classList.contains('tt-dark');

      if (isDark) {
        body.classList.remove('tt-dark');
        body.classList.add('tt-light');
      } else {
        body.classList.remove('tt-light');
        body.classList.add('tt-dark');
      }

      // Animate the switch
      gsap.to(styleSwitch, {
        rotation: 360,
        duration: 0.5,
        ease: 'power2.out',
      });
    });

    console.log('✅ Style switcher initialized');
  }

  /**
   * Initialize magnetic elements effect (replaces jQuery)
   */
  private async initMagneticElements() {
    if (!isPlatformBrowser(this.platformId)) return;

    const { gsap } = await this.libraryLoader.loadGSAP();
    if (!gsap) return;

    const magneticElements = document.querySelectorAll('.tt-magnetic-item');

    magneticElements.forEach((element: any) => {
      const handleMouseMove = (e: MouseEvent) => {
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

      const handleMouseLeave = () => {
        gsap.to(element, {
          x: 0,
          y: 0,
          duration: 0.3,
          ease: 'power2.out',
        });
      };

      element.addEventListener('mousemove', handleMouseMove);
      element.addEventListener('mouseleave', handleMouseLeave);
    });

    console.log('✅ Magnetic elements initialized');
  }

  /**
   * Initialize scroll to top functionality (replaces jQuery)
   */

  /**
   * Initialize our converted services after hydration is complete
   */
  private async initializeConvertedServices(): Promise<void> {
    try {
      console.log('🚀 Step 4: Initializing Advanced Angular Services...');

      // Initialize page transitions
      await this.pageTransitionsService.initialize();

      // Initialize background noise
      this.backgroundNoiseService.initialize();

      // Initialize smooth scroll
      this.smoothScrollService.init();

      // Initialize theme service
      await this.themeService.initialize();

      // Initialize advanced services
      // await this.isotopeService.initialize();
      await this.magicCursorService.initialize();
      await this.swipersService.initialize();

      console.log('✅ Converted services initialized');

      // Test the services after initialization
      console.log('📊 Service Status Report:');
      console.log('  Page Transitions:');
      console.log(
        '    - Enabled:',
        this.pageTransitionsService.transitionsEnabled
      );
      console.log(
        '    - In Transition:',
        this.pageTransitionsService.isInTransition
      );

      console.log('  Smooth Scroll:');
      console.log('    - Enabled:', this.smoothScrollService.isScrollEnabled());
      console.log('    - Scroll Y:', this.smoothScrollService.getScrollY());

      console.log('  Theme Service:');
      console.log('    - Current Theme:', this.themeService.currentTheme());
      console.log('    - Is Light Mode:', this.themeService.isLightMode());
      console.log('    - Is Available:', this.themeService.isAvailable);

      console.log('  Advanced Services:');
      console.log('    - Isotope Available:', this.isotopeService.isAvailable);
      console.log(
        '    - Isotope Initialized:',
        this.isotopeService.isInitialized()
      );
      console.log(
        '    - Magic Cursor Available:',
        this.magicCursorService.isAvailable
      );
      console.log(
        '    - Magic Cursor Initialized:',
        this.magicCursorService.isInitialized()
      );
      console.log('    - Swipers Available:', this.swipersService.isAvailable);
      console.log('    - Swipers Count:', this.swipersService.slidersCount());

      console.log('  Background Noise: Initialized');

      console.log(
        '🎉 Step 4 Complete: Isotope + Magic Cursor + Swipers services converted!'
      );
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
    console.log('🚀 All libraries initialized and ready!');
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

    // Remove any global event listeners - with additional browser check
    try {
      const magneticElements = document.querySelectorAll('.tt-magnetic-item');
      magneticElements.forEach((element: any) => {
        element.removeEventListener('mousemove', null);
        element.removeEventListener('mouseleave', null);
      });
    } catch (error) {
      // Ignore cleanup errors during SSR
      console.warn('Cleanup warning (SSR safe):', error);
    }

    console.log('🧹 All services and libraries cleaned up');
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
  ttSttProgressPath!: SVGPathElement;

  constructor() {}

  @HostListener('window:scroll', [])
  onWindowScroll() {
    if (isPlatformBrowser(this.platformId)) {
      this.updateButtonVisibility();
      this.updateProgress();
    }
  }

  updateButtonVisibility() {
    if (!isPlatformBrowser(this.platformId)) return;

    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    const btn = document.querySelector('.tt-scroll-to-top');
    if (btn) {
      if (scrollTop > this.ttSttOffset) {
        btn.classList.add('tt-stt-active');
      } else {
        btn.classList.remove('tt-stt-active');
      }
    }
  }

  updateProgress() {
    if (!isPlatformBrowser(this.platformId)) return;

    if (this.ttSttProgressPath) {
      const scrollTop =
        window.pageYOffset || document.documentElement.scrollTop;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const progress =
        this.ttSttPathLength - (scrollTop * this.ttSttPathLength) / docHeight;
      this.ttSttProgressPath.style.strokeDashoffset = `${progress}`;
    }
  }

  scrollToTop(event: Event) {
    event.preventDefault();
    const duration = 800;
    const start = window.scrollY;
    const startTime = performance.now();

    const easeInOutQuart = (
      time: number,
      from: number,
      distance: number,
      duration: number
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
   * Initialize scroll-to-top button functionality
   */
  private initializeScrollToTop(): void {
    // Initialize progress path
    this.ttSttProgressPath = document.querySelector(
      '.tt-stt-progress path'
    ) as SVGPathElement;

    if (this.ttSttProgressPath) {
      this.ttSttPathLength = this.ttSttProgressPath.getTotalLength();

      this.ttSttProgressPath.style.transition = 'none';
      this.ttSttProgressPath.style.strokeDasharray = `${this.ttSttPathLength} ${this.ttSttPathLength}`;
      this.ttSttProgressPath.style.strokeDashoffset = `${this.ttSttPathLength}`;
      this.ttSttProgressPath.style.transition = 'stroke-dashoffset 10ms linear';
    }

    this.updateButtonVisibility();
    this.updateProgress();
  }
}
