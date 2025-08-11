import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { LibraryLoaderService } from '../../services/library-loader.service';

declare var ScrollTrigger: any;

export interface IsotopeFilter {
  selector: string;
  label: string;
  active: boolean;
}

export interface IsotopeOptions {
  itemSelector: string;
  layoutMode: 'packery' | 'masonry' | 'fitRows';
  transitionDuration: string;
  percentPosition: boolean;
  stagger?: number;
}

@Injectable({
  providedIn: 'root',
})
export class IsotopeService {
  private platformId = inject(PLATFORM_ID);
  private libraryLoader = inject(LibraryLoaderService);

  // Signals for reactive state management
  private _isInitialized = signal(false);
  private _activeFilter = signal('*');
  private _isFiltering = signal(false);
  private _filters = signal<IsotopeFilter[]>([]);

  // Computed properties
  public readonly isInitialized = this._isInitialized.asReadonly();
  public readonly activeFilter = this._activeFilter.asReadonly();
  public readonly isFiltering = this._isFiltering.asReadonly();
  public readonly filters = this._filters.asReadonly();

  // Private properties
  private isotopeInstance: any = null;
  private imagesLoadedInstance: any = null;
  private container: HTMLElement | null = null;
  private defaultOptions: IsotopeOptions = {
    itemSelector: '.isotope-item',
    layoutMode: 'packery',
    transitionDuration: '0.5s',
    percentPosition: true,
  };

  constructor() {
    console.log('🧱 Isotope Service initialized');
  }

  /**
   * Initialize Isotope with container selector
   */
  public async initialize(
    containerSelector: string = '.isotope-items-wrap',
    options: Partial<IsotopeOptions> = {}
  ): Promise<void> {
    if (!isPlatformBrowser(this.platformId) || this._isInitialized()) {
      return;
    }

    try {
      // Wait for DOM to be ready
      await this.waitForDOM();

      // Get container element
      this.container = document.querySelector(containerSelector);
      if (!this.container) {
        console.warn(`🧱 Isotope: Container "${containerSelector}" not found`);
        return;
      }

      // Load required libraries
      const { Isotope, imagesLoaded, Packery } =
        await this.libraryLoader.loadIsotope();
      if (!Isotope || !imagesLoaded) {
        console.error('🧱 Failed to load Isotope or ImagesLoaded');
        return;
      }

      // Register Packery mode with Isotope if Packery is loaded
      if (Packery) {
        (Isotope as any).LayoutMode.modes.packery = Packery;
        console.log('🧱 Packery mode registered with Isotope');
      }

      // Initialize with imagesLoaded
      this.imagesLoadedInstance = imagesLoaded(this.container, () => {
        this.initializeIsotope(Isotope, { ...this.defaultOptions, ...options });
      });

      // Initialize filters
      this.initializeFilters();

      console.log('🧱 Isotope Service ready');
    } catch (error) {
      console.error('🧱 Error initializing Isotope:', error);
    }
  }

  /**
   * Initialize Isotope instance
   */
  private initializeIsotope(Isotope: any, options: IsotopeOptions): void {
    if (!this.container) return;

    this.isotopeInstance = new Isotope(this.container, options);
    this._isInitialized.set(true);

    // Setup intersection observer for performance
    this.setupIntersectionObserver();

    console.log('🧱 Isotope instance created');
  }

  /**
   * Initialize filter buttons and their state
   */
  private initializeFilters(): void {
    const filterButtons = document.querySelectorAll(
      '.ttgr-cat-list a, .ttgr-cat-classic-list a'
    );

    const filters: IsotopeFilter[] = Array.from(filterButtons).map(
      (button, index) => ({
        selector: button.getAttribute('data-filter') || '*',
        label: button.textContent?.trim() || `Filter ${index + 1}`,
        active: index === 0, // First filter is active by default
      })
    );

    this._filters.set(filters);

    // Setup click handlers
    this.setupFilterHandlers();
  }

  /**
   * Setup filter button click handlers
   */
  private setupFilterHandlers(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    // Classic filter handlers (maintain scroll position)
    const classicFilters = document.querySelectorAll(
      '.ttgr-cat-classic-item a'
    );
    classicFilters.forEach((button) => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        const filterSelector = button.getAttribute('data-filter') || '*';
        this.applyFilter(filterSelector, false);
        this.updateActiveFilter(button);
      });
    });

    // Regular filter handlers (reset scroll position)
    const regularFilters = document.querySelectorAll('.ttgr-cat-item a');
    regularFilters.forEach((button) => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        const filterSelector = button.getAttribute('data-filter') || '*';
        this.applyFilter(filterSelector, true);
        this.updateActiveFilter(button);
      });
    });
  }

  /**
   * Apply filter to Isotope grid
   */
  public applyFilter(selector: string, resetScroll: boolean = false): void {
    if (!this.isotopeInstance || this._isFiltering()) return;

    this._isFiltering.set(true);
    this._activeFilter.set(selector);

    try {
      // Apply filter
      this.isotopeInstance.arrange({ filter: selector });

      // Wait for transition to complete
      setTimeout(() => {
        this._isFiltering.set(false);

        // Refresh ScrollTrigger after layout
        if (typeof ScrollTrigger !== 'undefined') {
          if (resetScroll) {
            ScrollTrigger.refresh(true);
          } else {
            ScrollTrigger.refresh();
          }
        }
      }, parseFloat(this.defaultOptions.transitionDuration) * 1000);

      console.log(`🧱 Filter applied: ${selector}`);
    } catch (error) {
      console.error('🧱 Error applying filter:', error);
      this._isFiltering.set(false);
    }
  }

  /**
   * Update active filter visual state
   */
  private updateActiveFilter(clickedButton: Element): void {
    const allButtons = document.querySelectorAll(
      '.ttgr-cat-list a, .ttgr-cat-classic-list a'
    );

    allButtons.forEach((button) => button.classList.remove('active'));
    clickedButton.classList.add('active');

    // Update filters signal
    const filterSelector = clickedButton.getAttribute('data-filter') || '*';
    const updatedFilters = this._filters().map((filter) => ({
      ...filter,
      active: filter.selector === filterSelector,
    }));
    this._filters.set(updatedFilters);
  }

  /**
   * Refresh Isotope layout
   */
  public refresh(): void {
    if (this.isotopeInstance) {
      this.isotopeInstance.layout();
    }
  }

  /**
   * Add new items to Isotope
   */
  public addItems(items: HTMLElement[]): void {
    if (!this.isotopeInstance) return;

    this.isotopeInstance.insert(items);
    this.isotopeInstance.layout();
  }

  /**
   * Remove items from Isotope
   */
  public removeItems(items: HTMLElement[]): void {
    if (!this.isotopeInstance) return;

    this.isotopeInstance.remove(items);
    this.isotopeInstance.layout();
  }

  /**
   * Setup intersection observer for performance optimization
   */
  private setupIntersectionObserver(): void {
    if (!this.container || !('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Refresh layout when container becomes visible
            this.refresh();
          }
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(this.container);
  }

  /**
   * Wait for DOM to be ready
   */
  private waitForDOM(): Promise<void> {
    return new Promise((resolve) => {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => resolve());
      } else {
        resolve();
      }
    });
  }

  /**
   * Get filtered items count
   */
  public getFilteredItemsCount(): number {
    if (!this.isotopeInstance) return 0;
    return this.isotopeInstance.filteredItems.length;
  }

  /**
   * Get all items count
   */
  public getTotalItemsCount(): number {
    if (!this.isotopeInstance) return 0;
    return this.isotopeInstance.items.length;
  }

  /**
   * Destroy Isotope instance
   */
  public destroy(): void {
    if (this.isotopeInstance) {
      this.isotopeInstance.destroy();
      this.isotopeInstance = null;
    }

    if (this.imagesLoadedInstance) {
      this.imagesLoadedInstance = null;
    }

    this._isInitialized.set(false);
    this._activeFilter.set('*');
    this._isFiltering.set(false);
    this._filters.set([]);
    this.container = null;

    console.log('🧱 Isotope Service destroyed');
  }

  /**
   * Check if service is available
   */
  public get isAvailable(): boolean {
    return isPlatformBrowser(this.platformId) && this._isInitialized();
  }
}
