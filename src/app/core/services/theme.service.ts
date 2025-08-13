import { isPlatformBrowser } from '@angular/common';
import {
  computed,
  inject,
  Injectable,
  PLATFORM_ID,
  Renderer2,
  RendererFactory2,
  signal,
} from '@angular/core';
import { LibraryLoaderService } from '../../services/library-loader.service';

type Theme = 'light' | 'dark';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private platformId = inject(PLATFORM_ID);
  private rendererFactory = inject(RendererFactory2);
  private libraryLoader = inject(LibraryLoaderService);
  private renderer: Renderer2;

  // GSAP instance
  private gsapInstance: any = null;

  // Angular signals for reactive theme state
  private _currentTheme = signal<Theme>('dark');
  private _isInitialized = signal(false);

  // Computed values
  public readonly currentTheme = this._currentTheme.asReadonly();
  public readonly isLightMode = computed(
    () => this._currentTheme() === 'light'
  );
  public readonly isDarkMode = computed(() => this._currentTheme() === 'dark');
  public readonly isInitialized = this._isInitialized.asReadonly();

  // DOM elements
  private styleSwitch?: HTMLElement;
  private unlisten?: () => void; // Store event listener cleanup function

  constructor() {
    this.renderer = this.rendererFactory.createRenderer(null, null);
  }

  /**
   * Initialize theme functionality after hydration
   */
  public async initialize(): Promise<void> {
    if (!isPlatformBrowser(this.platformId) || this._isInitialized()) {
      return;
    }

    // Load GSAP for animations
    await this.loadGSAP();

    // Initialize the service
    // this.init();
  }

  /**
   * Load GSAP for switch animations
   */
  private async loadGSAP(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    try {
      const { gsap } = await this.libraryLoader.loadGSAP();
      if (gsap) {
        this.gsapInstance = gsap;
        console.log('✅ GSAP loaded successfully for theme service');
      }
    } catch (error) {
      console.warn('⚠️ Could not load GSAP for theme animations:', error);
    }
  }

  /**
   * Initialize theme functionality (Angular-compatible way)
   */
  // private init(): void {
  //   if (this._isInitialized()) {
  //     return;
  //   }

  //   // Get style switch element
  //   this.styleSwitch = document.querySelector('.tt-style-switch') || undefined;

  //   // Initialize theme state from localStorage
  //   // this.loadThemeFromStorage();

  //   // Setup style switch button using Angular's Renderer2
  //   // this.setupStyleSwitch();

  //   this._isInitialized.set(true);
  //   console.log('✅ Theme service initialized with Angular patterns');
  // }

  /**
   * Load theme from localStorage (Angular-compatible)
   */
  // private loadThemeFromStorage(): void {
  //   if (!isPlatformBrowser(this.platformId)) {
  //     return;
  //   }

  //   try {
  //     // Check for saved theme in localStorage
  //     const savedTheme = localStorage.getItem('tt-lightmode-on');

  //     // Check if light mode should be enabled by default
  //     const hasLightModeDefault = document.body.classList.contains(
  //       'tt-lightmode-default'
  //     );

  //     // Determine initial theme state
  //     if (hasLightModeDefault && savedTheme !== 'disabled') {
  //       this.setTheme('light', false); // Don't animate on init
  //     } else if (savedTheme === 'enabled') {
  //       this.setTheme('light', false);
  //     } else {
  //       this.setTheme('dark', false);
  //     }
  //   } catch (error) {
  //     console.warn('Could not load theme from localStorage:', error);
  //     this.setTheme('dark', false);
  //   }
  // }

  /**
   * Setup style switch button using Angular's Renderer2
   */
  private setupStyleSwitch(): void {
    if (!this.styleSwitch) return;

    // Use Renderer2 for event binding (better for SSR)
    this.unlisten = this.renderer.listen(
      this.styleSwitch,
      'click',
      (e: Event) => {
        e.preventDefault();
        // this.toggleTheme();
      }
    );
  }

  /**
   * Set theme with Angular patterns
   */
  // public setTheme(theme: Theme, animate: boolean = true): void {
  //   if (!isPlatformBrowser(this.platformId)) {
  //     return;
  //   }

  //   const previousTheme = this._currentTheme();
  //   this._currentTheme.set(theme);

  //   // Update DOM using Renderer2
  //   this.updateBodyClasses(theme);
  //   this.updateStyleSwitchState(theme);
  //   this.saveThemeToStorage(theme);

  //   // Animate if requested and theme changed
  //   if (animate && previousTheme !== theme) {
  //     this.animateSwitch();
  //   }

  //   // Dispatch theme change event
  //   this.dispatchThemeChangeEvent(theme);

  //   console.log(`🎨 Theme changed to: ${theme}`);
  // }

  /**
   * Update body classes using Renderer2
   */
  private updateBodyClasses(theme: Theme): void {
    const body = document.body;

    if (theme === 'light') {
      this.renderer.addClass(body, 'tt-lightmode-on');
    } else {
      this.renderer.removeClass(body, 'tt-lightmode-on');
    }
  }

  /**
   * Update style switch button state
   */
  private updateStyleSwitchState(theme: Theme): void {
    if (!this.styleSwitch) return;

    if (theme === 'light') {
      this.renderer.addClass(this.styleSwitch, 'active');
    } else {
      this.renderer.removeClass(this.styleSwitch, 'active');
    }
  }

  /**
   * Save theme to localStorage
   */
  private saveThemeToStorage(theme: Theme): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    try {
      const value = theme === 'light' ? 'enabled' : 'disabled';
      localStorage.setItem('tt-lightmode-on', value);
    } catch (error) {
      console.warn('Could not save theme to localStorage:', error);
    }
  }

  /**
   * Toggle theme (reactive with signals)
   */
  // public toggleTheme(): void {
  //   const newTheme: Theme = this._currentTheme() === 'light' ? 'dark' : 'light';
  //   this.setTheme(newTheme, true);
  // }

  /**
   * Animate style switch button (with null safety)
   */
  private animateSwitch(): void {
    if (!this.styleSwitch || !this.gsapInstance) {
      return;
    }

    // Type-safe GSAP animation
    this.gsapInstance.to(this.styleSwitch as any, {
      rotation: 360,
      duration: 0.5,
      ease: 'power2.out',
      onComplete: () => {
        if (this.styleSwitch && this.gsapInstance) {
          this.gsapInstance.set(this.styleSwitch as any, { rotation: 0 });
        }
      },
    });
  }

  /**
   * Dispatch theme change event (Angular-compatible)
   */
  private dispatchThemeChangeEvent(theme: Theme): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const event = new CustomEvent('themeChanged', {
      detail: {
        theme,
        isLight: theme === 'light',
        isDark: theme === 'dark',
      },
    });

    window.dispatchEvent(event);
  }

  /**
   * Get theme from localStorage (with error handling)
   */
  public getSavedTheme(): string | null {
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }

    try {
      return localStorage.getItem('tt-lightmode-on');
    } catch (error) {
      console.warn('Could not access localStorage:', error);
      return null;
    }
  }

  /**
   * Check if theme system is available
   */
  public get isAvailable(): boolean {
    return isPlatformBrowser(this.platformId) && this._isInitialized();
  }

  /**
   * Cleanup method for proper Angular lifecycle
   */
  public destroy(): void {
    // Remove event listeners
    if (this.unlisten) {
      this.unlisten();
      this.unlisten = undefined;
    }

    // Reset state
    this._isInitialized.set(false);
    this.styleSwitch = undefined;

    console.log('🧹 Theme service cleaned up');
  }
}
