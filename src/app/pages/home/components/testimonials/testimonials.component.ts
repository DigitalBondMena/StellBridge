import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  Inject,
  input,
  OnDestroy,
  PLATFORM_ID,
  QueryList,
  signal,
  ViewChildren,
} from '@angular/core';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SafeHtmlPipe } from '../../../../core/pipes/safe-html.pipe';
import { Testimonial } from '../../res/home';

@Component({
  selector: 'app-testimonials',
  standalone: true,
  imports: [CommonModule, SafeHtmlPipe],
  templateUrl: './testimonials.component.html',
  styleUrl: './testimonials.component.css',
})
export class TestimonialsComponent implements AfterViewInit, OnDestroy {
  // ViewChildren for DOM access
  @ViewChildren('ttStteItem') stickyItems!: QueryList<ElementRef<HTMLElement>>;
  @ViewChildren('ttStteCard') stickyCards!: QueryList<ElementRef<HTMLElement>>;

  // Configuration signals
  private isBrowser = signal<boolean>(false);
  private resizeTimeout = signal<number | null>(null);
  private scrollTriggerInstances: ScrollTrigger[] = [];

  // Reactive state using signals
  allTestimonials = input<Testimonial[]>([]);

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser.set(isPlatformBrowser(this.platformId));

    // Register GSAP plugins only in browser
    // if (this.isBrowser()) {
    //   gsap.registerPlugin(ScrollTrigger);
    // }
  }

  ngAfterViewInit(): void {
    if (this.isBrowser()) {
      // Wait for view to be fully rendered
      setTimeout(() => {
        // this.initializeStickyTestimonials();
      }, 100);
    }
  }

  ngOnDestroy(): void {
    this.cleanupScrollTriggers();
    this.clearResizeTimeout();
  }

  @HostListener('window:resize')
  @HostListener('window:orientationchange')
  onWindowResize(): void {
    if (!this.isBrowser()) return;

    this.clearResizeTimeout();

    const timeoutId = window.setTimeout(() => {
      this.setEqualHeight();
    }, 100);

    this.resizeTimeout.set(timeoutId);
  }

  private initializeStickyTestimonials(): void {
    if (!this.stickyItems || !this.stickyCards) return;

    // Set initial equal heights
    this.setEqualHeight();

    // Setup sticky animations for each item
    this.stickyItems.forEach((itemRef, index) => {
      const element = itemRef.nativeElement;
      const isLastChild = index === this.stickyItems.length - 1;

      // Calculate sticky offset
      const offset = this.calculateStickyOffset();

      // Set minimum height for sticky items
      this.setMinHeight(element, offset);

      // Create sticky animation for all items except the last one
      if (!isLastChild) {
        this.createStickyAnimation(element, offset);
      }
    });
  }

  private setEqualHeight(): void {
    if (!this.stickyCards) return;

    const cardElements = this.stickyCards
      .toArray()
      .map((ref) => ref.nativeElement);

    // Reset heights to auto for recalculation
    cardElements.forEach((card) => {
      card.style.height = 'auto';
    });

    // Find maximum height
    let maxHeight = 0;
    cardElements.forEach((card) => {
      const height = card.offsetHeight;
      if (height > maxHeight) {
        maxHeight = height;
      }
    });

    // Apply maximum height to all cards
    cardElements.forEach((card) => {
      card.style.height = `${maxHeight}px`;
    });
  }

  private calculateStickyOffset(): number {
    const header = document.getElementById('tt-header');

    if (
      header?.classList.contains('tt-header-fixed') ||
      header?.classList.contains('tt-header-scroll')
    ) {
      const headerInner = document.querySelector(
        '.tt-header-inner'
      ) as HTMLElement;
      return headerInner ? headerInner.offsetHeight + 30 : 90;
    }

    return 60;
  }

  private setMinHeight(element: HTMLElement, offset: number): void {
    const stickyItems = element.querySelectorAll('.tt-stp-item');
    const minHeight = `calc(100vh - ${
      offset * (stickyItems.length > 0 ? 1.4 : 2)
    }px)`;

    stickyItems.forEach((item) => {
      (item as HTMLElement).style.minHeight = minHeight;
    });
  }

  private createStickyAnimation(element: HTMLElement, offset: number): void {
    const timeline = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: element,
        pin: true,
        start: `top ${offset}`,
        end: `bottom ${offset - 30}`,
        pinSpacing: false,
        scrub: true,
        markers: false,
        onRefresh: () => {
          // Recalculate heights when ScrollTrigger refreshes
          this.setEqualHeight();
        },
      },
    });

    // Store reference for cleanup
    if (timeline.scrollTrigger) {
      this.scrollTriggerInstances.push(timeline.scrollTrigger);
    }

    // Scale and fade animation
    timeline.to(element, {
      scale: 0.77,
      opacity: 0.88,
    });

    timeline.set(element, {
      autoAlpha: 0,
    });
  }

  private cleanupScrollTriggers(): void {
    this.scrollTriggerInstances.forEach((trigger) => {
      trigger.kill();
    });
    this.scrollTriggerInstances = [];
  }

  private clearResizeTimeout(): void {
    const timeoutId = this.resizeTimeout();
    if (timeoutId !== null) {
      window.clearTimeout(timeoutId);
      this.resizeTimeout.set(null);
    }
  }
}
