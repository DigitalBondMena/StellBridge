import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  input,
  OnDestroy,
  PLATFORM_ID,
  signal,
  ViewChild,
} from '@angular/core';

// Swiper imports
import { Swiper, SwiperOptions } from 'swiper/types';
import { IMAGE_BASE_URL } from '../../../../core/env';
import { Client } from '../../res/home';

@Component({
  selector: 'app-clients',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './clients.component.html',
  styleUrl: './clients.component.css',
})
export class ClientsComponent implements OnDestroy, AfterViewInit {
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  @ViewChild('swiperContainer', { static: false }) swiperContainer!: ElementRef;

  clients = input<Client[]>();

  imageUrl = IMAGE_BASE_URL;

  // Swiper instance
  private swiperInstance: Swiper | null = null;

  // Slider configuration
  private readonly autoplayInterval = 3000; // 3 seconds
  private readonly slidesPerView = {
    mobile: 2,
    tablet: 4,
    desktop: 6,
  };

  // Reactive state using signals
  private currentSlideIndex = signal(0);
  private autoplayActive = signal(true);
  private isInitialized = signal(false);

  // Sample client data - using placeholder images for now

  // Computed values
  currentIndex = computed(() => this.currentSlideIndex());
  isAutoplayActive = computed(() => this.autoplayActive());
  initialized = computed(() => this.isInitialized());

  // Swiper configuration
  private swiperConfig: SwiperOptions = {
    // Core settings
    direction: 'horizontal',
    loop: true,
    centeredSlides: false,

    // Responsive breakpoints
    slidesPerView: 2,
    spaceBetween: 15,
    breakpoints: {
      480: {
        slidesPerView: 3,
        spaceBetween: 20,
      },
      768: {
        slidesPerView: 4,
        spaceBetween: 25,
      },
      992: {
        slidesPerView: 5,
        spaceBetween: 30,
      },
      1200: {
        slidesPerView: 6,
        spaceBetween: 30,
      },
    },

    // Touch/Drag settings
    touchRatio: 1,
    touchAngle: 45,
    grabCursor: true,
    allowTouchMove: true,

    // Autoplay
    autoplay: {
      delay: this.autoplayInterval,
      disableOnInteraction: false,
      pauseOnMouseEnter: true,
    },

    // Navigation
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    },

    // Pagination
    pagination: {
      el: '.swiper-pagination',
      clickable: true,
      type: 'bullets',
    },

    // Events
    on: {
      slideChange: (swiper) => {
        this.currentSlideIndex.set(swiper.realIndex);
      },
      init: () => {
        this.isInitialized.set(true);
      },
    },
  };

  constructor() {
    // Watch autoplay state changes
    effect(() => {
      if (this.swiperInstance && this.isBrowser) {
        if (this.autoplayActive()) {
          this.swiperInstance.autoplay.start();
        } else {
          this.swiperInstance.autoplay.stop();
        }
      }
    });
  }

  async ngAfterViewInit(): Promise<void> {
    if (this.isBrowser) {
      await this.initializeSwiper();
    }
  }

  ngOnDestroy(): void {
    this.destroySwiper();
  }

  private async initializeSwiper(): Promise<void> {
    try {
      // Dynamic import for SSR compatibility
      const { Swiper } = await import('swiper');
      const { Navigation, Pagination, Autoplay } = await import(
        'swiper/modules'
      );

      // Initialize Swiper
      this.swiperInstance = new Swiper(this.swiperContainer.nativeElement, {
        ...this.swiperConfig,
        modules: [Navigation, Pagination, Autoplay],
      });
    } catch (error) {
      console.error('Failed to initialize Swiper:', error);
    }
  }

  private destroySwiper(): void {
    if (this.swiperInstance) {
      this.swiperInstance.destroy(true, true);
      this.swiperInstance = null;
    }
  }

  // Navigation methods
  nextSlide(): void {
    if (this.swiperInstance) {
      this.swiperInstance.slideNext();
    }
  }

  previousSlide(): void {
    if (this.swiperInstance) {
      this.swiperInstance.slidePrev();
    }
  }

  goToSlide(index: number): void {
    if (this.swiperInstance) {
      this.swiperInstance.slideTo(index);
    }
  }

  // Autoplay methods
  toggleAutoplay(): void {
    this.autoplayActive.update((active) => !active);
  }

  // Mouse interaction handlers
  onMouseEnter(): void {
    if (this.swiperInstance && this.autoplayActive()) {
      this.swiperInstance.autoplay.stop();
    }
  }

  onMouseLeave(): void {
    if (this.swiperInstance && this.autoplayActive()) {
      this.swiperInstance.autoplay.start();
    }
  }
}
