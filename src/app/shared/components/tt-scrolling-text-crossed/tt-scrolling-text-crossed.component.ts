import { isPlatformBrowser } from '@angular/common';
import {
  Component,
  ElementRef,
  OnDestroy,
  PLATFORM_ID,
  QueryList,
  ViewChildren,
  afterNextRender,
  inject,
} from '@angular/core';
import { gsap } from 'gsap';

interface ScrollingTextData {
  speed: number;
  oppositeDirection: boolean;
  changeDirection: boolean;
  element: ElementRef<HTMLElement>;
  tween?: gsap.core.Tween;
  currentScroll: number;
  isScrollingDown: boolean;
}

@Component({
  selector: 'app-tt-scrolling-text-crossed',
  imports: [],
  templateUrl: './tt-scrolling-text-crossed.component.html',
  styleUrl: './tt-scrolling-text-crossed.component.css',
})
export class TtScrollingTextCrossedComponent implements OnDestroy {
  @ViewChildren('scrollingText') scrollingTextElements!: QueryList<
    ElementRef<HTMLElement>
  >;

  private platformId = inject(PLATFORM_ID);
  private scrollingTextData: ScrollingTextData[] = [];
  private scrollListener?: () => void;

  constructor() {
    // Only run DOM manipulation after render on browser
    afterNextRender(() => {
      if (isPlatformBrowser(this.platformId)) {
        this.initializeScrollingText();
      }
    });
  }

  ngOnDestroy(): void {
    // Cleanup GSAP tweens and scroll listener
    this.scrollingTextData.forEach((data) => {
      if (data.tween) {
        data.tween.kill();
      }
    });

    if (this.scrollListener && isPlatformBrowser(this.platformId)) {
      window.removeEventListener('scroll', this.scrollListener);
    }
  }

  private initializeScrollingText(): void {
    this.scrollingTextElements.forEach((elementRef) => {
      const element = elementRef.nativeElement;
      const contentElement = element.querySelector(
        '.tt-scrt-content'
      ) as HTMLElement;

      if (!contentElement) return;

      // Clone content 5 times
      this.cloneContent(contentElement);

      // Get data attributes
      const speed = this.getDataAttribute(element, 'scroll-speed', 10);
      const oppositeDirection = this.getDataAttribute(
        element,
        'opposite-direction',
        false
      );
      const changeDirection = this.getDataAttribute(
        element,
        'change-direction',
        false
      );

      // Create scrolling text data
      const scrollData: ScrollingTextData = {
        speed,
        oppositeDirection,
        changeDirection,
        element: elementRef,
        currentScroll: window.pageYOffset,
        isScrollingDown: true,
      };

      // Setup GSAP animation
      this.setupGSAPAnimation(element, scrollData);

      this.scrollingTextData.push(scrollData);
    });

    // Setup scroll listener if any element has change direction enabled
    this.setupScrollListener();
  }

  private cloneContent(contentElement: HTMLElement): void {
    const cloneCount = 5;

    for (let i = 0; i < cloneCount; i++) {
      const clonedElement = contentElement.cloneNode(true) as HTMLElement;
      clonedElement.setAttribute('aria-hidden', 'true');
      contentElement.parentNode?.insertBefore(
        clonedElement,
        contentElement.nextSibling
      );
    }
  }

  private setupGSAPAnimation(
    element: HTMLElement,
    scrollData: ScrollingTextData
  ): void {
    const direction = scrollData.oppositeDirection ? 100 : -100;
    const contentElements = element.querySelectorAll('.tt-scrt-content');

    // Create GSAP tween
    scrollData.tween = gsap
      .to(contentElements, {
        duration: scrollData.speed,
        xPercent: direction,
        repeat: -1,
        ease: 'linear',
      })
      .totalProgress(0.5);

    // Set initial position for inner container
    const innerElement = element.querySelector('.tt-scrt-inner');
    if (innerElement) {
      gsap.set(innerElement, { xPercent: -50 });
    }
  }

  private setupScrollListener(): void {
    const hasChangeDirection = this.scrollingTextData.some(
      (data) => data.changeDirection
    );

    if (!hasChangeDirection) return;

    this.scrollListener = () => {
      const currentScroll = window.pageYOffset;

      this.scrollingTextData.forEach((data) => {
        if (!data.changeDirection || !data.tween) return;

        const element = data.element.nativeElement;

        if (currentScroll > data.currentScroll) {
          data.isScrollingDown = true;
          element.classList.remove('scrolled-up');
        } else {
          data.isScrollingDown = false;
          element.classList.add('scrolled-up');
        }

        gsap.to(data.tween, {
          timeScale: data.isScrollingDown ? 1 : -1,
        });

        data.currentScroll = currentScroll;
      });
    };

    window.addEventListener('scroll', this.scrollListener, { passive: true });
  }

  private getDataAttribute(
    element: HTMLElement,
    attribute: string,
    defaultValue: any
  ): any {
    const value = element.dataset[this.camelCase(attribute)];

    if (value === undefined) return defaultValue;
    if (value === 'true') return true;
    if (value === 'false') return false;
    if (!isNaN(Number(value))) return Number(value);

    return value;
  }

  private camelCase(str: string): string {
    return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
  }
}
