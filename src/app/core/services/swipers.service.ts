import { isPlatformBrowser } from '@angular/common';
import {
  Injectable,
  PLATFORM_ID,
  computed,
  inject,
  signal,
} from '@angular/core';
import { LibraryLoaderService } from '../../services/library-loader.service';
import { DeviceDetectionService } from './device-detection.service';
import { SmoothScrollService } from './smooth-scroll.service';

declare var ScrollTrigger: any;

export interface SwiperConfig {
  direction: 'horizontal' | 'vertical';
  slidesPerView: number | 'auto';
  centeredSlides?: boolean;
  speed?: number;
  autoplay?:
    | {
        delay: number;
        disableOnInteraction: boolean;
      }
    | false;
  loop?: boolean;
  parallax?: boolean;
  mousewheel?: boolean;
  keyboard?: boolean;
  simulateTouch?: boolean;
  grabCursor?: boolean;
  navigation?: boolean;
  pagination?: {
    type: 'bullets' | 'fraction' | 'progressbar';
    dynamicBullets?: boolean;
    clickable?: boolean;
  };
  breakpoints?: Record<number, Partial<SwiperConfig>>;
}

export interface SwiperInstance {
  id: string;
  element: HTMLElement;
  swiper: any;
  config: SwiperConfig;
  isActive: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class SwipersService {
  private platformId = inject(PLATFORM_ID);
  private libraryLoader = inject(LibraryLoaderService);
  private deviceService = inject(DeviceDetectionService);
  private smoothScrollService = inject(SmoothScrollService);

  // Signals for reactive state management
  private _isInitialized = signal(false);
  private _activeSliders = signal<SwiperInstance[]>([]);
  private _isLoading = signal(false);

  // Computed properties
  public readonly isInitialized = this._isInitialized.asReadonly();
  public readonly activeSliders = this._activeSliders.asReadonly();
  public readonly isLoading = this._isLoading.asReadonly();
  public readonly slidersCount = computed(() => this._activeSliders().length);

  // Library instances
  private swiperLibrary: any = null;
  private swiperModules: any = null;
  private gsapInstance: any = null;
  private eventListeners: Array<() => void> = [];

  constructor() {
    console.log('🎠 Swipers Service initialized');
  }

  /**
   * Initialize Swipers service
   */
  public async initialize(): Promise<void> {
    if (!isPlatformBrowser(this.platformId) || this._isInitialized()) {
      return;
    }

    this._isLoading.set(true);

    try {
      // Load Swiper library
      const { Swiper, modules } = await this.libraryLoader.loadSwiper();

      if (!Swiper) {
        throw new Error('Failed to load Swiper library');
      }

      this.swiperLibrary = Swiper;
      this.swiperModules = modules;

      // Load GSAP for scale effects
      const { gsap } = await this.libraryLoader.loadGSAP();
      if (gsap) {
        this.gsapInstance = gsap;
        console.log('✅ GSAP loaded successfully for swipers');
      }

      // Initialize all sliders on the page
      await this.initializeAllSliders();

      this._isInitialized.set(true);
      console.log('✅ Swipers Service initialized with library versions');
    } catch (error) {
      console.error('❌ Error initializing Swipers Service:', error);
    } finally {
      this._isLoading.set(false);
    }
  }

  /**
   * Initialize all sliders on the page
   */
  private async initializeAllSliders(): Promise<void> {
    const sliderSelectors = [
      '.tt-portfolio-slider',
      '.tt-content-slider',
      '.tt-content-carousel',
    ];

    for (const selector of sliderSelectors) {
      const elements = document.querySelectorAll(selector);
      elements.forEach((element) => {
        this.initializeSlider(element as HTMLElement);
      });
    }
  }

  /**
   * Initialize a specific slider
   */
  public async initializeSlider(
    element: HTMLElement,
    customConfig?: Partial<SwiperConfig>
  ): Promise<string | null> {
    if (!isPlatformBrowser(this.platformId) || !this.swiperLibrary) {
      return null;
    }

    try {
      const sliderId = this.generateSliderId(element);

      // Check if already initialized
      if (this.getSliderById(sliderId)) {
        console.warn(`🎠 Slider ${sliderId} already initialized`);
        return sliderId;
      }

      const swiperElement = element.querySelector('.swiper') as HTMLElement;
      if (!swiperElement) {
        console.warn('🎠 Swiper container not found in element');
        return null;
      }

      const config = this.buildSwiperConfig(element, customConfig);
      const swiper = new this.swiperLibrary(swiperElement, config);

      const instance: SwiperInstance = {
        id: sliderId,
        element,
        swiper,
        config,
        isActive: true,
      };

      // Add to active sliders
      this._activeSliders.update((sliders) => [...sliders, instance]);

      // Setup slider-specific behaviors
      this.setupSliderBehaviors(instance);

      console.log(`🎠 Slider ${sliderId} initialized`);
      return sliderId;
    } catch (error) {
      console.error('🎠 Error initializing slider:', error);
      return null;
    }
  }

  /**
   * Build Swiper configuration based on element and type
   */
  private buildSwiperConfig(
    element: HTMLElement,
    customConfig?: Partial<SwiperConfig>
  ): any {
    let config: SwiperConfig = {
      direction: 'horizontal',
      slidesPerView: 1,
      speed: 900,
      autoplay: false,
      loop: false,
      parallax: false,
      mousewheel: false,
      keyboard: false,
      simulateTouch: true,
      grabCursor: true,
      navigation: false,
      pagination: {
        type: 'bullets',
        dynamicBullets: true,
        clickable: true,
      },
    };

    // Portfolio slider specific config
    if (element.classList.contains('tt-portfolio-slider')) {
      config = this.getPortfolioSliderConfig(element);
    }

    // Content slider specific config
    else if (element.classList.contains('tt-content-slider')) {
      config = this.getContentSliderConfig(element);
    }

    // Content carousel specific config
    else if (element.classList.contains('tt-content-carousel')) {
      config = this.getContentCarouselConfig(element);
    }

    // Apply custom configuration
    if (customConfig) {
      config = { ...config, ...customConfig };
    }

    // Convert to Swiper-compatible format
    return this.convertToSwiperConfig(config, element);
  }

  /**
   * Get portfolio slider configuration
   */
  private getPortfolioSliderConfig(element: HTMLElement): SwiperConfig {
    const direction =
      (element.getAttribute('data-direction') as 'horizontal' | 'vertical') ||
      'vertical';
    const speed = parseInt(element.getAttribute('data-speed') || '900', 10);
    const autoplayDelay = element.getAttribute('data-autoplay');
    const loop = element.getAttribute('data-loop') === 'true';
    const parallax = element.getAttribute('data-parallax') === 'true';
    const mousewheel = element.getAttribute('data-mousewheel') === 'true';
    const keyboard = element.getAttribute('data-keyboard') === 'true';
    const simulateTouch =
      element.getAttribute('data-simulate-touch') !== 'false';

    return {
      direction,
      slidesPerView: 'auto',
      centeredSlides: true,
      speed,
      autoplay: autoplayDelay
        ? {
            delay: parseInt(autoplayDelay, 10),
            disableOnInteraction: true,
          }
        : false,
      loop,
      parallax,
      mousewheel,
      keyboard,
      simulateTouch,
      grabCursor: true,
      navigation: true,
      pagination: {
        type: 'fraction',
        clickable: true,
      },
    };
  }

  /**
   * Get content slider configuration
   */
  private getContentSliderConfig(element: HTMLElement): SwiperConfig {
    const speed = parseInt(element.getAttribute('data-speed') || '800', 10);
    const autoplayDelay = element.getAttribute('data-autoplay');
    const loop = element.getAttribute('data-loop') === 'true';
    const paginationType =
      (element.getAttribute('data-pagination-type') as
        | 'bullets'
        | 'fraction'
        | 'progressbar') || 'bullets';

    // Check if navigation has special cursor classes
    const hasArrowCursors = element.querySelector(
      '.tt-cs-nav-prev.cursor-arrow-left, .tt-cs-nav-next.cursor-arrow-right'
    );

    return {
      direction: 'horizontal',
      slidesPerView: 1,
      speed,
      autoplay: autoplayDelay
        ? {
            delay: parseInt(autoplayDelay, 10),
            disableOnInteraction: true,
          }
        : false,
      loop,
      parallax: true,
      simulateTouch: !hasArrowCursors,
      grabCursor: !hasArrowCursors,
      navigation: true,
      pagination: {
        type: paginationType,
        dynamicBullets: true,
        clickable: true,
      },
    };
  }

  /**
   * Get content carousel configuration
   */
  private getContentCarouselConfig(element: HTMLElement): SwiperConfig {
    const speed = parseInt(element.getAttribute('data-speed') || '900', 10);
    const autoplayDelay = element.getAttribute('data-autoplay');
    const loop = element.getAttribute('data-loop') === 'true';
    const simulateTouch =
      element.getAttribute('data-simulate-touch') !== 'false';
    const paginationType =
      (element.getAttribute('data-pagination-type') as
        | 'bullets'
        | 'fraction'
        | 'progressbar') || 'bullets';
    const sizeSmall = element.getAttribute('data-size-small') === 'true';

    return {
      direction: 'horizontal',
      slidesPerView: 1,
      centeredSlides: !sizeSmall,
      speed,
      autoplay: autoplayDelay
        ? {
            delay: parseInt(autoplayDelay, 10),
            disableOnInteraction: true,
          }
        : false,
      loop,
      simulateTouch,
      grabCursor: simulateTouch,
      navigation: true,
      pagination: {
        type: paginationType,
        dynamicBullets: true,
        clickable: true,
      },
      breakpoints: {
        991: {
          slidesPerView: sizeSmall ? 3 : 2,
          centeredSlides: !sizeSmall,
        },
      },
    };
  }

  /**
   * Convert configuration to Swiper-compatible format
   */
  private convertToSwiperConfig(
    config: SwiperConfig,
    element: HTMLElement
  ): any {
    const swiperConfig: any = {
      direction: config.direction,
      slidesPerView: config.slidesPerView,
      speed: config.speed,
      loop: config.loop,
      parallax: config.parallax,
      mousewheel: config.mousewheel,
      keyboard: config.keyboard,
      simulateTouch: config.simulateTouch,
      grabCursor: config.grabCursor,
      longSwipesRatio: 0.1,
      resistanceRatio: 0,
    };

    // Add centeredSlides if specified
    if (config.centeredSlides !== undefined) {
      swiperConfig.centeredSlides = config.centeredSlides;
    }

    // Add autoplay if specified
    if (config.autoplay) {
      swiperConfig.autoplay = config.autoplay;
    }

    // Add navigation if specified
    if (config.navigation) {
      const navNext = element.querySelector(
        '.tt-posl-nav-next, .tt-cs-nav-next, .tt-cc-nav-next'
      );
      const navPrev = element.querySelector(
        '.tt-posl-nav-prev, .tt-cs-nav-prev, .tt-cc-nav-prev'
      );

      if (navNext || navPrev) {
        swiperConfig.navigation = {
          nextEl: navNext,
          prevEl: navPrev,
          disabledClass: element.classList.contains('tt-portfolio-slider')
            ? 'tt-posl-nav-arrow-disabled'
            : element.classList.contains('tt-content-slider')
            ? 'tt-cs-nav-arrow-disabled'
            : 'tt-cc-nav-arrow-disabled',
        };
      }
    }

    // Add pagination if specified
    if (config.pagination) {
      const paginationEl = element.querySelector(
        '.tt-posl-pagination, .tt-cs-pagination, .tt-cc-pagination'
      );

      if (paginationEl) {
        swiperConfig.pagination = {
          el: paginationEl,
          type: config.pagination.type,
          clickable: config.pagination.clickable,
          dynamicBullets: config.pagination.dynamicBullets,
        };

        // Add custom classes based on slider type
        if (element.classList.contains('tt-portfolio-slider')) {
          swiperConfig.pagination.modifierClass = 'tt-posl-pagination-';
          swiperConfig.pagination.verticalClass = 'tt-posl-pagination-vertical';
          if (config.pagination.type === 'fraction') {
            swiperConfig.pagination.renderFraction = function (
              currentClass: string,
              totalClass: string
            ) {
              return `<span class="${currentClass}"></span> <span class="${totalClass}"></span>`;
            };
          }
        } else if (element.classList.contains('tt-content-slider')) {
          swiperConfig.pagination.modifierClass = 'tt-cs-pagination-';
        } else if (element.classList.contains('tt-content-carousel')) {
          swiperConfig.pagination.modifierClass = 'tt-cc-pagination-';
        }
      }
    }

    // Add breakpoints if specified
    if (config.breakpoints) {
      swiperConfig.breakpoints = config.breakpoints;
    }

    // Add event handlers
    swiperConfig.on = this.getSwiperEventHandlers(element);

    return swiperConfig;
  }

  /**
   * Get Swiper event handlers
   */
  private getSwiperEventHandlers(element: HTMLElement): any {
    const handlers: any = {};

    // Portfolio slider specific events
    if (element.classList.contains('tt-portfolio-slider')) {
      handlers.init = (swiper: any) => {
        const activeSlide = swiper.slides[swiper.activeIndex];
        if (activeSlide) {
          // Auto-play video in first slide
          this.handleSlideVideo(activeSlide, 'play');
        }
      };

      handlers.transitionStart = (swiper: any) => {
        const activeSlide = swiper.slides[swiper.activeIndex];
        if (activeSlide) {
          // Handle light background detection
          setTimeout(() => {
            if (activeSlide.classList?.contains('tt-posl-bg-is-light')) {
              document.body.classList.add('tt-posl-light-bg-on');
            } else {
              document.body.classList.remove('tt-posl-light-bg-on');
            }
          }, 200);

          // Play video in active slide
          this.handleSlideVideo(activeSlide, 'play');
        }
      };

      handlers.transitionEnd = (swiper: any) => {
        // Pause videos in non-active slides
        swiper.slides.forEach((slide: HTMLElement, index: number) => {
          if (index !== swiper.activeIndex) {
            this.handleSlideVideo(slide, 'pause');
          }
        });
      };
    }

    return handlers;
  }

  /**
   * Handle video play/pause in slides
   */
  private handleSlideVideo(slide: HTMLElement, action: 'play' | 'pause'): void {
    const videos = slide.querySelectorAll('video');
    videos.forEach((video) => {
      if (action === 'play') {
        if (video.readyState >= 3) {
          video.play().catch(() => {}); // Ignore autoplay errors
        } else {
          video.addEventListener(
            'loadeddata',
            () => {
              video.play().catch(() => {}); // Ignore autoplay errors
            },
            { once: true }
          );
        }
      } else {
        video.pause();
      }
    });
  }

  /**
   * Setup slider-specific behaviors
   */
  private setupSliderBehaviors(instance: SwiperInstance): void {
    // Content carousel scale-down animation
    if (
      instance.element.classList.contains('tt-content-carousel') &&
      instance.element.classList.contains('cc-scale-down') &&
      instance.config.simulateTouch
    ) {
      this.setupCarouselScaleEffect(instance);
    }

    // Add lightbox icons to items with data-fancybox
    if (instance.element.classList.contains('tt-content-carousel')) {
      this.addLightboxIcons(instance.element);
    }
  }

  /**
   * Setup carousel scale effect
   */
  private setupCarouselScaleEffect(instance: SwiperInstance): void {
    const swiperWrapper = instance.element.querySelector('.swiper-wrapper');
    const carouselItems = instance.element.querySelectorAll(
      '.tt-content-carousel-item'
    );

    if (!swiperWrapper || !this.gsapInstance) return;

    const mouseDownHandler = (e: Event) => {
      const mouseEvent = e as MouseEvent;
      if (mouseEvent.which === 1) {
        // Left mouse button only
        this.gsapInstance.to(carouselItems, {
          duration: 0.7,
          scale: 0.9,
        });
      }
    };

    const touchStartHandler = (e: Event) => {
      this.gsapInstance.to(carouselItems, {
        duration: 0.7,
        scale: 0.9,
      });
    };

    const pointerDownHandler = (e: Event) => {
      const pointerEvent = e as PointerEvent;
      if (
        pointerEvent.pointerType === 'mouse' &&
        (pointerEvent as any).which === 1
      ) {
        this.gsapInstance.to(carouselItems, {
          duration: 0.7,
          scale: 0.9,
        });
      }
    };

    const mouseUpHandler = () => {
      this.gsapInstance.to(carouselItems, {
        duration: 0.7,
        scale: 1,
        clearProps: 'scale',
      });
    };

    swiperWrapper.addEventListener('mousedown', mouseDownHandler);
    swiperWrapper.addEventListener('touchstart', touchStartHandler);
    swiperWrapper.addEventListener('pointerdown', pointerDownHandler);

    document.addEventListener('mouseup', mouseUpHandler);
    document.addEventListener('touchend', mouseUpHandler);
    document.addEventListener('pointerup', mouseUpHandler);
    document.addEventListener('mouseleave', mouseUpHandler);

    // Store cleanup functions
    this.eventListeners.push(
      () => swiperWrapper.removeEventListener('mousedown', mouseDownHandler),
      () => swiperWrapper.removeEventListener('touchstart', touchStartHandler),
      () =>
        swiperWrapper.removeEventListener('pointerdown', pointerDownHandler),
      () => document.removeEventListener('mouseup', mouseUpHandler),
      () => document.removeEventListener('touchend', mouseUpHandler),
      () => document.removeEventListener('pointerup', mouseUpHandler),
      () => document.removeEventListener('mouseleave', mouseUpHandler)
    );
  }

  /**
   * Add lightbox icons to carousel items
   */
  private addLightboxIcons(element: HTMLElement): void {
    const items = element.querySelectorAll(
      '.tt-content-carousel-item[data-fancybox]'
    );
    items.forEach((item) => {
      if (!item.querySelector('.tt-lightbox-icon')) {
        const icon = document.createElement('div');
        icon.className = 'tt-lightbox-icon';
        item.appendChild(icon);
      }
    });
  }

  /**
   * Generate unique slider ID
   */
  private generateSliderId(element: HTMLElement): string {
    const id = element.id || element.className.split(' ')[0] || 'slider';
    const timestamp = Date.now();
    return `${id}-${timestamp}`;
  }

  /**
   * Get slider by ID
   */
  public getSliderById(id: string): SwiperInstance | undefined {
    return this._activeSliders().find((slider) => slider.id === id);
  }

  /**
   * Get slider by element
   */
  public getSliderByElement(element: HTMLElement): SwiperInstance | undefined {
    return this._activeSliders().find((slider) => slider.element === element);
  }

  /**
   * Destroy specific slider
   */
  public destroySlider(id: string): void {
    const slider = this.getSliderById(id);
    if (!slider) return;

    try {
      // Destroy Swiper instance
      if (slider.swiper && slider.swiper.destroy) {
        slider.swiper.destroy(true, true);
      }

      // Remove from active sliders
      this._activeSliders.update((sliders) =>
        sliders.filter((s) => s.id !== id)
      );

      console.log(`🎠 Slider ${id} destroyed`);
    } catch (error) {
      console.error(`🎠 Error destroying slider ${id}:`, error);
    }
  }

  /**
   * Destroy all sliders
   */
  public destroyAllSliders(): void {
    const sliders = this._activeSliders();
    sliders.forEach((slider) => {
      this.destroySlider(slider.id);
    });
  }

  /**
   * Refresh all sliders (useful after layout changes)
   */
  public refreshAllSliders(): void {
    this._activeSliders().forEach((slider) => {
      if (slider.swiper && slider.swiper.update) {
        slider.swiper.update();
      }
    });
  }

  /**
   * Check if service is available
   */
  public get isAvailable(): boolean {
    return isPlatformBrowser(this.platformId) && this._isInitialized();
  }

  /**
   * Destroy service
   */
  public destroy(): void {
    // Destroy all sliders
    this.destroyAllSliders();

    // Remove event listeners
    this.eventListeners.forEach((cleanup) => cleanup());
    this.eventListeners = [];

    // Reset state
    this._isInitialized.set(false);
    this._activeSliders.set([]);
    this._isLoading.set(false);

    // Clear library references
    this.swiperLibrary = null;
    this.swiperModules = null;
    this.gsapInstance = null;

    console.log('🎠 Swipers Service destroyed');
  }
}
