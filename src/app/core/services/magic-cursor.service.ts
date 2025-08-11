import { isPlatformBrowser } from '@angular/common';
import {
  Injectable,
  PLATFORM_ID,
  Renderer2,
  RendererFactory2,
  inject,
  signal,
} from '@angular/core';
import { LibraryLoaderService } from '../../services/library-loader.service';
import { DeviceDetectionService } from './device-detection.service';

export interface CursorState {
  x: number;
  y: number;
  width: number;
  height: number;
  opacity: number;
  borderWidth: number;
  isActive: boolean;
  mode: 'default' | 'magnetic' | 'drag' | 'view' | 'arrow' | 'close' | 'alter';
}

@Injectable({
  providedIn: 'root',
})
export class MagicCursorService {
  private platformId = inject(PLATFORM_ID);
  private libraryLoader = inject(LibraryLoaderService);
  private deviceService = inject(DeviceDetectionService);
  private renderer: Renderer2;

  // GSAP instances
  private gsapInstance: any = null;
  private gsapPower2: any = null;

  // Signals for reactive state management
  private _isInitialized = signal(false);
  private _cursorState = signal<CursorState>({
    x: 0,
    y: 0,
    width: 36,
    height: 36,
    opacity: 1,
    borderWidth: 2,
    isActive: false,
    mode: 'default',
  });

  // Computed properties
  public readonly isInitialized = this._isInitialized.asReadonly();
  public readonly cursorState = this._cursorState.asReadonly();

  // Private properties - matching original jQuery code structure
  private ballElement: HTMLElement | null = null;
  private ballMouse = { x: 0, y: 0 }; // Cursor position
  private ballPos = { x: 0, y: 0 }; // Ball position
  private ballRatio = 0.15; // delay follow cursor
  private ballActive = false;
  private isEnabled = false;
  private eventListeners: Array<() => void> = [];

  // Ball dimensions - matching original jQuery code
  private ballWidth = 36; // Ball default width
  private ballHeight = 36; // Ball default height
  private ballOpacity = 1; // Ball default opacity
  private ballBorderWidth = 2; // Ball default border width

  private ballMagneticWidth = 70; // Ball magnetic width
  private ballMagneticHeight = 70; // Ball magnetic height

  private ballAlterWidth = 100; // Cursor alter width
  private ballAlterHeight = 100; // Cursor alter height

  private ballViewWidth = 130; // Ball view width
  private ballViewHeight = 130; // Ball view height

  private ballDragWidth = 100; // Ball drag width
  private ballDragHeight = 100; // Ball drag height

  private ballDragMouseDownWidth = 50; // Ball drag width
  private ballDragMouseDownHeight = 50; // Ball drag height

  private ballArrowWidth = 100; // Ball arrow width
  private ballArrowHeight = 100; // Ball arrow height

  private ballCloseWidth = 100; // Ball close width
  private ballCloseHeight = 100; // Ball close height

  constructor(rendererFactory: RendererFactory2) {
    this.renderer = rendererFactory.createRenderer(null, null);
    console.log('✨ Magic Cursor Service initialized');
  }

  /**
   * Initialize magic cursor
   */
  public async initialize(): Promise<void> {
    if (!isPlatformBrowser(this.platformId) || this._isInitialized()) {
      return;
    }

    // Only initialize on desktop with magic cursor enabled
    if (
      this.deviceService.isMobile ||
      window.innerWidth <= 1024 ||
      !document.body.classList.contains('tt-magic-cursor')
    ) {
      console.log('✨ Magic cursor disabled (mobile/small screen)');
      return;
    }

    try {
      // Load GSAP
      const { gsap: gsapInstance } = await this.libraryLoader.loadGSAP();
      if (!gsapInstance) {
        console.error('✨ Failed to load GSAP for magic cursor');
        return;
      }

      // Store GSAP instance
      this.gsapInstance = gsapInstance;
      this.gsapPower2 = (gsapInstance as any).Power2 || {
        easeOut: 'power2.out',
      };

      // Setup magnetic item wrappers
      this.setupMagneticWrappers();

      // Get or create cursor element
      await this.createCursorElement();

      // Setup mouse tracking
      this.setupMouseTracking();

      // Setup all cursor behaviors
      this.setupAllCursorBehaviors();

      // Setup cursor visibility
      this.setupCursorVisibility();

      this.isEnabled = true;
      this._isInitialized.set(true);

      console.log('✨ Magic Cursor initialized successfully');
    } catch (error) {
      console.error('✨ Error initializing Magic Cursor:', error);
    }
  }

  /**
   * Setup magnetic item wrappers
   */
  private setupMagneticWrappers(): void {
    // Only run on client side to prevent SSR hydration issues
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const magneticItems = document.querySelectorAll('.tt-magnetic-item');
    magneticItems.forEach((item) => {
      if (!item.parentElement?.classList.contains('magnetic-wrap')) {
        const wrapper = this.renderer.createElement('div');
        this.renderer.addClass(wrapper, 'magnetic-wrap');
        this.renderer.insertBefore(item.parentNode, wrapper, item);
        this.renderer.appendChild(wrapper, item);
      }
    });

    // Handle magnetic buttons
    const magneticBtns = document.querySelectorAll('.tt-btn.tt-magnetic-item');
    magneticBtns.forEach((btn) => {
      const wrap = btn.closest('.magnetic-wrap');
      if (wrap) {
        this.renderer.addClass(wrap, 'tt-magnetic-btn');
      }
    });
  }

  /**
   * Create or get cursor element
   */
  private async createCursorElement(): Promise<void> {
    // Only run on client side to prevent SSR hydration issues
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.ballElement = document.getElementById('ball');

    if (!this.ballElement) {
      // Create cursor element if it doesn't exist
      this.ballElement = this.renderer.createElement('div');
      this.renderer.setAttribute(this.ballElement, 'id', 'ball');
      this.renderer.appendChild(document.body, this.ballElement);
    }

    // Set initial styles using GSAP to match original jQuery code
    if (this.gsapInstance) {
      this.gsapInstance.set(this.ballElement, {
        xPercent: -50,
        yPercent: -50,
        width: this.ballWidth,
        height: this.ballHeight,
        borderWidth: this.ballBorderWidth,
        opacity: this.ballOpacity,
      });
    }
  }

  /**
   * Setup mouse position tracking
   */
  private setupMouseTracking(): void {
    // Only run on client side to prevent SSR hydration issues
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const mouseMoveHandler = (e: MouseEvent) => {
      this.ballMouse.x = e.clientX;
      this.ballMouse.y = e.clientY;
    };

    document.addEventListener('mousemove', mouseMoveHandler);
    this.eventListeners.push(() =>
      document.removeEventListener('mousemove', mouseMoveHandler)
    );

    // Start GSAP ticker for smooth cursor movement
    this.startAnimationLoop();
  }

  /**
   * Start GSAP ticker for smooth cursor movement
   */
  private startAnimationLoop(): void {
    // Only run on client side to prevent SSR hydration issues
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    if (typeof this.gsapInstance === 'undefined') return;

    const updatePosition = () => {
      if (!this.isEnabled || !this.ballElement) return;

      if (!this.ballActive) {
        this.ballPos.x += (this.ballMouse.x - this.ballPos.x) * this.ballRatio;
        this.ballPos.y += (this.ballMouse.y - this.ballPos.y) * this.ballRatio;

        this.gsapInstance.set(this.ballElement, {
          x: this.ballPos.x,
          y: this.ballPos.y,
        });
      }
    };

    this.gsapInstance.ticker.add(updatePosition);

    // Store cleanup function
    this.eventListeners.push(() =>
      this.gsapInstance.ticker.remove(updatePosition)
    );
  }

  /**
   * Setup all cursor behaviors
   */
  private setupAllCursorBehaviors(): void {
    // Only run on client side to prevent SSR hydration issues
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.setupMagneticBehavior();
    this.setupAlterCursor();
    this.setupViewCursor();
    this.setupDragCursor();
    this.setupDragMouseDownCursor();
    this.setupArrowCursors();
    this.setupCloseCursor();
    this.setupHoverEffect();
  }

  /**
   * Setup magnetic behavior for cursor
   */
  private setupMagneticBehavior(): void {
    // Only run on client side to prevent SSR hydration issues
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const magneticWraps = document.querySelectorAll('.magnetic-wrap');
    magneticWraps.forEach((wrap) => {
      const magneticItem = wrap.querySelector('.tt-magnetic-item');
      if (!magneticItem) return;

      const mouseMoveHandler = (e: Event) => {
        if (!this.isEnabled || !this.ballElement) return;
        const mouseEvent = e as MouseEvent;
        this.callParallax(mouseEvent, wrap as HTMLElement);
      };

      const mouseEnterHandler = () => {
        if (!this.isEnabled || !this.ballElement) return;
        this.ballActive = true;
        this._cursorState.update((state) => ({
          ...state,
          mode: 'magnetic',
          width: this.ballMagneticWidth,
          height: this.ballMagneticHeight,
        }));

        if (this.gsapInstance) {
          this.gsapInstance.to(this.ballElement, {
            width: this.ballMagneticWidth,
            height: this.ballMagneticHeight,
            duration: 0.3,
            ease: this.gsapPower2?.easeOut,
          });
        }
      };

      const mouseLeaveHandler = () => {
        if (!this.isEnabled || !this.ballElement) return;
        this.ballActive = false;
        this._cursorState.update((state) => ({
          ...state,
          mode: 'default',
          width: this.ballWidth,
          height: this.ballHeight,
        }));

        if (this.gsapInstance) {
          this.gsapInstance.to(this.ballElement, {
            width: this.ballWidth,
            height: this.ballHeight,
            duration: 0.3,
            ease: this.gsapPower2?.easeOut,
          });
        }
      };

      magneticItem.addEventListener('mousemove', mouseMoveHandler);
      magneticItem.addEventListener('mouseenter', mouseEnterHandler);
      magneticItem.addEventListener('mouseleave', mouseLeaveHandler);

      // Store cleanup functions
      this.eventListeners.push(() => {
        magneticItem.removeEventListener('mousemove', mouseMoveHandler);
        magneticItem.removeEventListener('mouseenter', mouseEnterHandler);
        magneticItem.removeEventListener('mouseleave', mouseLeaveHandler);
      });
    });
  }

  /**
   * Parallax cursor movement for magnetic items
   */
  private parallaxCursor(
    e: MouseEvent,
    parent: HTMLElement,
    movement: number
  ): void {
    if (typeof this.gsapInstance === 'undefined') return;

    const rect = parent.getBoundingClientRect();
    const relX = e.clientX - rect.left;
    const relY = e.clientY - rect.top;

    this.ballPos.x =
      rect.left + rect.width / 2 + (relX - rect.width / 2) / movement;
    this.ballPos.y =
      rect.top + rect.height / 2 + (relY - rect.height / 2) / movement;

    this.gsapInstance.to(this.ballElement, {
      duration: 0.3,
      x: this.ballPos.x,
      y: this.ballPos.y,
    });
  }

  /**
   * Call parallax for magnetic items
   */
  private callParallax(e: MouseEvent, parent: HTMLElement): void {
    const target = parent.querySelector('.tt-magnetic-item') as HTMLElement;
    if (target) {
      this.parallaxIt(e, parent, target, 25);
    }
  }

  /**
   * Parallax animation for magnetic items
   */
  private parallaxIt(
    e: MouseEvent,
    parent: HTMLElement,
    target: HTMLElement,
    movement: number
  ): void {
    if (typeof this.gsapInstance === 'undefined') return;

    const boundingRect = parent.getBoundingClientRect();
    const relX = e.clientX - boundingRect.left;
    const relY = e.clientY - boundingRect.top;

    this.gsapInstance.to(target, {
      duration: 0.3,
      x: ((relX - boundingRect.width / 2) / boundingRect.width) * movement,
      y: ((relY - boundingRect.height / 2) / boundingRect.height) * movement,
      ease: this.gsapPower2.easeOut,
    });
  }

  /**
   * Setup alter cursor behavior
   */
  private setupAlterCursor(): void {
    // Only run on client side to prevent SSR hydration issues
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const alterElements = document.querySelectorAll(
      '.tt-btn[data-cursor="alter"], .tt-btn.tt-btn-alter'
    );
    alterElements.forEach((element) => {
      const mouseOverHandler = () => {
        if (!this.isEnabled || !this.ballElement) return;
        this._cursorState.update((state) => ({
          ...state,
          mode: 'alter',
          width: this.ballAlterWidth,
          height: this.ballAlterHeight,
        }));

        if (this.gsapInstance) {
          this.gsapInstance.to(this.ballElement, {
            width: this.ballAlterWidth,
            height: this.ballAlterHeight,
            duration: 0.3,
            ease: this.gsapPower2?.easeOut,
          });
        }
      };

      const mouseLeaveHandler = () => {
        if (!this.isEnabled || !this.ballElement) return;
        this._cursorState.update((state) => ({
          ...state,
          mode: 'default',
          width: this.ballWidth,
          height: this.ballHeight,
        }));

        if (this.gsapInstance) {
          this.gsapInstance.to(this.ballElement, {
            width: this.ballWidth,
            height: this.ballHeight,
            duration: 0.3,
            ease: this.gsapPower2?.easeOut,
          });
        }
      };

      element.addEventListener('mouseover', mouseOverHandler);
      element.addEventListener('mouseleave', mouseLeaveHandler);

      // Store cleanup functions
      this.eventListeners.push(() => {
        element.removeEventListener('mouseover', mouseOverHandler);
        element.removeEventListener('mouseleave', mouseLeaveHandler);
      });
    });
  }

  /**
   * Setup view cursor behavior
   */
  private setupViewCursor(): void {
    // Only run on client side to prevent SSR hydration issues
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const viewElements = document.querySelectorAll('[data-cursor]');
    viewElements.forEach((element) => {
      const mouseEnterHandler = () => {
        if (!this.isEnabled || !this.ballElement) return;
        this._cursorState.update((state) => ({
          ...state,
          mode: 'view',
          width: this.ballViewWidth,
          height: this.ballViewHeight,
        }));

        if (this.gsapInstance) {
          this.gsapInstance.to(this.ballElement, {
            width: this.ballViewWidth,
            height: this.ballViewHeight,
            duration: 0.3,
            ease: this.gsapPower2?.easeOut,
          });
        }
      };

      const mouseLeaveHandler = () => {
        if (!this.isEnabled || !this.ballElement) return;
        this._cursorState.update((state) => ({
          ...state,
          mode: 'default',
          width: this.ballWidth,
          height: this.ballHeight,
        }));

        if (this.gsapInstance) {
          this.gsapInstance.to(this.ballElement, {
            width: this.ballWidth,
            height: this.ballHeight,
            duration: 0.3,
            ease: this.gsapPower2?.easeOut,
          });
        }
      };

      element.addEventListener('mouseenter', mouseEnterHandler);
      element.addEventListener('mouseleave', mouseLeaveHandler);

      // Store cleanup functions
      this.eventListeners.push(() => {
        element.removeEventListener('mouseenter', mouseEnterHandler);
        element.removeEventListener('mouseleave', mouseLeaveHandler);
      });
    });
  }

  /**
   * Setup drag cursor behavior
   */
  private setupDragCursor(): void {
    // Only run on client side to prevent SSR hydration issues
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const swiperElements = document.querySelectorAll('.swiper');
    swiperElements.forEach((swiper) => {
      const mouseEnterHandler = () => {
        if (!this.isEnabled || !this.ballElement) return;
        this._cursorState.update((state) => ({
          ...state,
          mode: 'drag',
          width: this.ballDragWidth,
          height: this.ballDragHeight,
        }));

        if (this.gsapInstance) {
          this.gsapInstance.to(this.ballElement, {
            width: this.ballDragWidth,
            height: this.ballDragHeight,
            duration: 0.3,
            ease: this.gsapPower2?.easeOut,
          });
        }
      };

      const mouseLeaveHandler = () => {
        if (!this.isEnabled || !this.ballElement) return;
        this._cursorState.update((state) => ({
          ...state,
          mode: 'default',
          width: this.ballWidth,
          height: this.ballHeight,
        }));

        if (this.gsapInstance) {
          this.gsapInstance.to(this.ballElement, {
            width: this.ballWidth,
            height: this.ballHeight,
            duration: 0.3,
            ease: this.gsapPower2?.easeOut,
          });
        }
      };

      swiper.addEventListener('mouseenter', mouseEnterHandler);
      swiper.addEventListener('mouseleave', mouseLeaveHandler);

      // Store cleanup functions
      this.eventListeners.push(() => {
        swiper.removeEventListener('mouseenter', mouseEnterHandler);
        swiper.removeEventListener('mouseleave', mouseLeaveHandler);
      });
    });
  }

  /**
   * Setup drag mouse down cursor behavior
   */
  private setupDragMouseDownCursor(): void {
    // Only run on client side to prevent SSR hydration issues
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const swiperElements = document.querySelectorAll('.swiper');
    swiperElements.forEach((swiper) => {
      const mouseDownHandler = (e: Event) => {
        if (!this.isEnabled || !this.ballElement) return;
        this._cursorState.update((state) => ({
          ...state,
          width: this.ballDragMouseDownWidth,
          height: this.ballDragMouseDownHeight,
        }));

        if (this.gsapInstance) {
          this.gsapInstance.to(this.ballElement, {
            width: this.ballDragMouseDownWidth,
            height: this.ballDragMouseDownHeight,
            duration: 0.3,
            ease: this.gsapPower2?.easeOut,
          });
        }
      };

      const mouseUpHandler = () => {
        if (!this.isEnabled || !this.ballElement) return;
        this._cursorState.update((state) => ({
          ...state,
          width: this.ballDragWidth,
          height: this.ballDragHeight,
        }));

        if (this.gsapInstance) {
          this.gsapInstance.to(this.ballElement, {
            width: this.ballDragWidth,
            height: this.ballDragHeight,
            duration: 0.3,
            ease: this.gsapPower2?.easeOut,
          });
        }
      };

      const mouseLeaveHandler = () => {
        if (!this.isEnabled || !this.ballElement) return;
        this._cursorState.update((state) => ({
          ...state,
          width: this.ballWidth,
          height: this.ballHeight,
        }));

        if (this.gsapInstance) {
          this.gsapInstance.to(this.ballElement, {
            width: this.ballWidth,
            height: this.ballHeight,
            duration: 0.3,
            ease: this.gsapPower2?.easeOut,
          });
        }
      };

      swiper.addEventListener('mousedown', mouseDownHandler);
      swiper.addEventListener('mouseup', mouseUpHandler);
      swiper.addEventListener('mouseleave', mouseLeaveHandler);

      // Store cleanup functions
      this.eventListeners.push(() => {
        swiper.removeEventListener('mousedown', mouseDownHandler);
        swiper.removeEventListener('mouseup', mouseUpHandler);
        swiper.removeEventListener('mouseleave', mouseLeaveHandler);
      });
    });
  }

  /**
   * Setup arrow cursors behavior
   */
  private setupArrowCursors(): void {
    // Only run on client side to prevent SSR hydration issues
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    // Left arrow cursor
    const leftArrowElements = document.querySelectorAll('.cursor-arrow-left');
    leftArrowElements.forEach((element) => {
      const mouseEnterHandler = () => {
        if (!this.isEnabled || !this.ballElement) return;
        this._cursorState.update((state) => ({
          ...state,
          mode: 'arrow',
          width: this.ballArrowWidth,
          height: this.ballArrowHeight,
        }));

        if (this.gsapInstance) {
          this.gsapInstance.to(this.ballElement, {
            width: this.ballArrowWidth,
            height: this.ballArrowHeight,
            duration: 0.3,
            ease: this.gsapPower2?.easeOut,
          });
        }
      };

      const mouseLeaveHandler = () => {
        if (!this.isEnabled || !this.ballElement) return;
        this._cursorState.update((state) => ({
          ...state,
          mode: 'default',
          width: this.ballWidth,
          height: this.ballHeight,
        }));

        if (this.gsapInstance) {
          this.gsapInstance.to(this.ballElement, {
            width: this.ballWidth,
            height: this.ballHeight,
            duration: 0.3,
            ease: this.gsapPower2?.easeOut,
          });
        }
      };

      element.addEventListener('mouseenter', mouseEnterHandler);
      element.addEventListener('mouseleave', mouseLeaveHandler);

      // Store cleanup functions
      this.eventListeners.push(() => {
        element.removeEventListener('mouseenter', mouseEnterHandler);
        element.removeEventListener('mouseleave', mouseLeaveHandler);
      });
    });

    // Right arrow cursor
    const rightArrowElements = document.querySelectorAll('.cursor-arrow-right');
    rightArrowElements.forEach((element) => {
      const mouseEnterHandler = () => {
        if (!this.isEnabled || !this.ballElement) return;
        this._cursorState.update((state) => ({
          ...state,
          mode: 'arrow',
          width: this.ballArrowWidth,
          height: this.ballArrowHeight,
        }));

        if (this.gsapInstance) {
          this.gsapInstance.to(this.ballElement, {
            width: this.ballArrowWidth,
            height: this.ballArrowHeight,
            duration: 0.3,
            ease: this.gsapPower2?.easeOut,
          });
        }
      };

      const mouseLeaveHandler = () => {
        if (!this.isEnabled || !this.ballElement) return;
        this._cursorState.update((state) => ({
          ...state,
          mode: 'default',
          width: this.ballWidth,
          height: this.ballHeight,
        }));

        if (this.gsapInstance) {
          this.gsapInstance.to(this.ballElement, {
            width: this.ballWidth,
            height: this.ballHeight,
            duration: 0.3,
            ease: this.gsapPower2?.easeOut,
          });
        }
      };

      element.addEventListener('mouseenter', mouseEnterHandler);
      element.addEventListener('mouseleave', mouseLeaveHandler);

      // Store cleanup functions
      this.eventListeners.push(() => {
        element.removeEventListener('mouseenter', mouseEnterHandler);
        element.removeEventListener('mouseleave', mouseLeaveHandler);
      });
    });
  }

  /**
   * Setup close cursor behavior
   */
  private setupCloseCursor(): void {
    // Only run on client side to prevent SSR hydration issues
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const closeElements = document.querySelectorAll('.cursor-close');
    closeElements.forEach((element) => {
      const showCursorClose = () => {
        if (!this.isEnabled || !this.ballElement) return;
        this._cursorState.update((state) => ({
          ...state,
          mode: 'close',
          width: this.ballCloseWidth,
          height: this.ballCloseHeight,
        }));

        if (this.gsapInstance) {
          this.gsapInstance.to(this.ballElement, {
            width: this.ballCloseWidth,
            height: this.ballCloseHeight,
            duration: 0.3,
            ease: this.gsapPower2?.easeOut,
          });
        }
      };

      const hideCursorClose = () => {
        if (!this.isEnabled || !this.ballElement) return;
        this._cursorState.update((state) => ({
          ...state,
          mode: 'default',
          width: this.ballWidth,
          height: this.ballHeight,
        }));

        if (this.gsapInstance) {
          this.gsapInstance.to(this.ballElement, {
            width: this.ballWidth,
            height: this.ballHeight,
            duration: 0.3,
            ease: this.gsapPower2?.easeOut,
          });
        }
      };

      const mouseEnterHandler = () => showCursorClose();
      const mouseLeaveHandler = () => hideCursorClose();

      element.addEventListener('mouseenter', mouseEnterHandler);
      element.addEventListener('mouseleave', mouseLeaveHandler);

      // Handle special cases for hide elements
      const hideMouseEnterHandler = () => hideCursorClose();
      const hideMouseLeaveHandler = () => showCursorClose();

      element.addEventListener('mouseenter', hideMouseEnterHandler);
      element.addEventListener('mouseleave', hideMouseLeaveHandler);

      // Store cleanup functions
      this.eventListeners.push(() => {
        element.removeEventListener('mouseenter', mouseEnterHandler);
        element.removeEventListener('mouseleave', mouseLeaveHandler);
        element.removeEventListener('mouseenter', hideMouseEnterHandler);
        element.removeEventListener('mouseleave', hideMouseLeaveHandler);
      });
    });
  }

  /**
   * Setup hover effect behavior
   */
  private setupHoverEffect(): void {
    // Only run on client side to prevent SSR hydration issues
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const hoverElements = document.querySelectorAll('.cursor-hover-effect');
    hoverElements.forEach((element) => {
      const mouseEnterHandler = () => {
        document.body.classList.add('ph-mask-active');
      };

      const mouseLeaveHandler = () => {
        document.body.classList.remove('ph-mask-active');
      };

      element.addEventListener('mouseenter', mouseEnterHandler);
      element.addEventListener('mouseleave', mouseLeaveHandler);

      // Store cleanup functions
      this.eventListeners.push(() => {
        element.removeEventListener('mouseenter', mouseEnterHandler);
        element.removeEventListener('mouseleave', mouseLeaveHandler);
      });
    });
  }

  /**
   * Setup cursor visibility
   */
  private setupCursorVisibility(): void {
    // Only run on client side to prevent SSR hydration issues
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    // Hide cursor on hover - exact jQuery selector conversion
    // $("a, button, .tt-magnetic-btn, .tt-form-control, .tt-form-radio, .tt-form-check, .tt-hide-cursor, .tt-video, iframe, body.ph-mask-on .ph-caption, .tt-cfm-close")
    const allHideSelectors = [
      'a',
      'button',
      '.tt-magnetic-btn',
      '.tt-form-control',
      '.tt-form-radio',
      '.tt-form-check',
      '.tt-hide-cursor',
      '.tt-video',
      'iframe',
      'body.ph-mask-on .ph-caption',
      '.tt-cfm-close',
    ];

    const hideElements = document.querySelectorAll(allHideSelectors.join(', '));

    hideElements.forEach((element) => {
      // Convert jQuery .not() chains to proper filtering
      // .not(".not-hide-cursor") // omit from selection (class "not-hide-cursor" is for global use).
      // .not(".cursor-alter") // omit from selection
      // .not("#page-header:not(.ph-full) .tt-scroll-down-inner") // omit from selection
      // .not(".ph-social > ul > li a") // omit from selection
      // .not(".ph-share-buttons > ul > li a") // omit from selection
      // .not(".tt-social-buttons > ul > li a") // omit from selection
      // .not(".tt-main-menu-list > li > a") // omit from selection
      // .not(".tt-main-menu-list > li > .tt-submenu-trigger > a") // omit from selection

      if (
        element.classList.contains('not-hide-cursor') ||
        element.classList.contains('cursor-alter') ||
        element.matches('#page-header:not(.ph-full) .tt-scroll-down-inner') ||
        element.matches('.ph-social > ul > li a') ||
        element.matches('.ph-share-buttons > ul > li a') ||
        element.matches('.tt-social-buttons > ul > li a') ||
        element.matches('.tt-main-menu-list > li > a') ||
        element.matches('.tt-main-menu-list > li > .tt-submenu-trigger > a')
      ) {
        return;
      }

      const mouseEnterHandler = () => {
        if (typeof this.gsapInstance !== 'undefined' && this.ballElement) {
          this.gsapInstance.to(this.ballElement, {
            duration: 0.3,
            scale: 0,
            opacity: 0,
          });
        }
      };

      const mouseLeaveHandler = () => {
        if (typeof this.gsapInstance !== 'undefined' && this.ballElement) {
          this.gsapInstance.to(this.ballElement, {
            duration: 0.3,
            scale: 1,
            opacity: this.ballOpacity,
          });
        }
      };

      element.addEventListener('mouseenter', mouseEnterHandler);
      element.addEventListener('mouseleave', mouseLeaveHandler);

      this.eventListeners.push(
        () => element.removeEventListener('mouseenter', mouseEnterHandler),
        () => element.removeEventListener('mouseleave', mouseLeaveHandler)
      );
    });

    // Hide cursor on link clicks - exact jQuery selector conversion
    // $("a")
    // .not('[target="_blank"]') // omit from selection.
    // .not('[href^="#"]') // omit from selection.
    // .not('[href^="mailto"]') // omit from selection.
    // .not('[href^="tel"]') // omit from selection.
    // .not(".tt-btn-disabled") // omit from selection
    // .not("[data-fancybox]") // omit from selection
    const allLinks = document.querySelectorAll('a');
    allLinks.forEach((link) => {
      if (
        link.getAttribute('target') === '_blank' ||
        link.getAttribute('href')?.startsWith('#') ||
        link.getAttribute('href')?.startsWith('mailto') ||
        link.getAttribute('href')?.startsWith('tel') ||
        link.classList.contains('tt-btn-disabled') ||
        link.hasAttribute('data-fancybox')
      ) {
        return;
      }

      const clickHandler = () => {
        if (typeof this.gsapInstance !== 'undefined' && this.ballElement) {
          this.gsapInstance.to(this.ballElement, {
            duration: 0.3,
            scale: 1.3,
            autoAlpha: 0,
          });
        }
      };

      link.addEventListener('click', clickHandler);
      this.eventListeners.push(() =>
        link.removeEventListener('click', clickHandler)
      );
    });

    // Show/hide cursor on document leave/enter - exact jQuery conversion
    // $(document).on("mouseleave", function () {
    //   gsap.to("#magic-cursor", { duration: 0.3, autoAlpha: 0 });
    // }).on("mouseenter", function () {
    //   gsap.to("#magic-cursor", { duration: 0.3, autoAlpha: 1 });
    // });
    const documentLeaveHandler = () => {
      if (typeof this.gsapInstance !== 'undefined') {
        const magicCursor = document.getElementById('magic-cursor');
        if (magicCursor) {
          this.gsapInstance.to(magicCursor, { duration: 0.3, autoAlpha: 0 });
        }
      }
    };

    const documentEnterHandler = () => {
      if (typeof this.gsapInstance !== 'undefined') {
        const magicCursor = document.getElementById('magic-cursor');
        if (magicCursor) {
          this.gsapInstance.to(magicCursor, { duration: 0.3, autoAlpha: 1 });
        }
      }
    };

    // Show as the mouse moves - exact jQuery conversion
    // $(document).mousemove(function () {
    //   gsap.to("#magic-cursor", { duration: 0.3, autoAlpha: 1 });
    // });
    const documentMoveHandler = () => {
      if (typeof this.gsapInstance !== 'undefined') {
        const magicCursor = document.getElementById('magic-cursor');
        if (magicCursor) {
          this.gsapInstance.to(magicCursor, { duration: 0.3, autoAlpha: 1 });
        }
      }
    };

    document.addEventListener('mouseleave', documentLeaveHandler);
    document.addEventListener('mouseenter', documentEnterHandler);
    document.addEventListener('mousemove', documentMoveHandler);

    this.eventListeners.push(
      () => document.removeEventListener('mouseleave', documentLeaveHandler),
      () => document.removeEventListener('mouseenter', documentEnterHandler),
      () => document.removeEventListener('mousemove', documentMoveHandler)
    );
  }

  /**
   * Check if service is available
   */
  public get isAvailable(): boolean {
    return (
      isPlatformBrowser(this.platformId) &&
      this._isInitialized() &&
      this.isEnabled
    );
  }

  /**
   * Destroy magic cursor
   */
  public destroy(): void {
    // Remove all event listeners
    this.eventListeners.forEach((cleanup) => cleanup());
    this.eventListeners = [];

    // Remove cursor element
    if (this.ballElement && this.ballElement.parentNode) {
      this.renderer.removeChild(this.ballElement.parentNode, this.ballElement);
    }

    // Reset state
    this._isInitialized.set(false);
    this.isEnabled = false;
    this.ballElement = null;
    this.ballActive = false;

    console.log('✨ Magic Cursor Service destroyed');
  }
}
