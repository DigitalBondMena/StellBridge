import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  inject,
  Input,
  OnDestroy,
  OnInit,
  Renderer2,
  signal,
  ViewChild,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { SafeHtmlPipe } from '../../../core/pipes/safe-html.pipe';
import { Service } from '../../../pages/home/res/home';

interface AccordionItem {
  id: string;
  isActive: boolean;
  isOpen: boolean;
}

@Component({
  selector: 'app-shared-service-card',
  imports: [CommonModule, RouterLink, SafeHtmlPipe],
  templateUrl: './shared-service-card.component.html',
  styleUrl: './shared-service-card.component.css',
})
export class SharedServiceCardComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  private router = inject(Router);
  private renderer = inject(Renderer2);
  private elementRef = inject(ElementRef);
  private resizeTimeout: any;

  @ViewChild('horizontalAccordion', { static: false })
  horizontalAccordion?: ElementRef;

  // Services data using signals
  @Input({ required: true }) services = signal<Service[]>([]);

  // Accordion state management using signals
  accordionItems = signal<AccordionItem[]>([]);
  horizontalAccordionItems = signal<AccordionItem[]>([]);
  activeHorizontalItem = signal<string | null>(null);

  constructor() {}

  ngOnInit(): void {
    this.initializeAccordionItems();
  }

  ngAfterViewInit(): void {
    this.initializeAccordions();
    this.initializeHorizontalAccordion();
  }

  ngOnDestroy(): void {
    if (this.resizeTimeout) {
      clearTimeout(this.resizeTimeout);
    }
  }

  // TrackBy function for performance
  trackByServiceId = (index: number, service: Service): string => service.slug;
  trackByAccordionId = (index: number, item: AccordionItem): string => item.id;

  /**
   * Initialize accordion items state
   */
  private initializeAccordionItems(): void {
    const services = this.services();
    const items: AccordionItem[] = services.map((service) => ({
      id: service.slug,
      isActive: false,
      isOpen: false,
    }));

    this.accordionItems.set(items);
    this.horizontalAccordionItems.set([...items]);
  }

  /**
   * Initialize regular accordions - converted from jQuery
   */
  private initializeAccordions(): void {
    // Find all accordion elements
    const accordions =
      this.elementRef.nativeElement.querySelectorAll('.tt-accordion');

    accordions.forEach((accordion: HTMLElement) => {
      // Check for items with "is-open" class and set them as active
      const accordionItems = accordion.querySelectorAll('.tt-accordion-item');

      accordionItems.forEach((item: Element) => {
        const htmlItem = item as HTMLElement;
        const content = htmlItem.querySelector('.tt-accordion-content');
        if (content?.classList.contains('is-open')) {
          htmlItem.classList.add('active');
          // Update signal state
          const itemId = this.getItemIdFromElement(htmlItem);
          if (itemId) {
            this.updateAccordionItemState(itemId, true, true);
          }
        }
      });
    });
  }

  /**
   * Initialize horizontal accordion - converted from jQuery
   */
  private initializeHorizontalAccordion(): void {
    const horAccordions = this.elementRef.nativeElement.querySelectorAll(
      '.tt-horizontal-accordion'
    );

    horAccordions.forEach((accordion: HTMLElement) => {
      const items = accordion.querySelectorAll('.tt-hac-item');
      const itemCount = items.length;
      const itemWidth = 100 / itemCount + '%';

      if (itemCount === 0) return;

      // Set z-index in reverse order
      items.forEach((item: Element, index: number) => {
        const htmlItem = item as HTMLElement;
        this.renderer.setStyle(htmlItem, 'z-index', itemCount - index);
        this.renderer.setStyle(htmlItem, 'width', itemWidth);
      });

      // Calculate and set content width
      this.calculateHorizontalAccordionSize();
    });
  }

  /**
   * Handle regular accordion item click - converted from jQuery
   */
  onAccordionItemClick(serviceId: string, event: Event): void {
    event.preventDefault();

    const currentItems = this.accordionItems();
    const clickedItem = currentItems.find((item) => item.id === serviceId);

    if (!clickedItem) return;

    if (clickedItem.isActive) {
      // Close the active item
      this.updateAccordionItemState(serviceId, false, false);
      this.slideUp(serviceId);
    } else {
      // Close all other items and open this one
      const updatedItems = currentItems.map((item) => ({
        ...item,
        isActive: item.id === serviceId,
        isOpen: item.id === serviceId,
      }));

      this.accordionItems.set(updatedItems);

      // Close all other contents
      currentItems.forEach((item) => {
        if (item.id !== serviceId && item.isActive) {
          this.slideUp(item.id);
        }
      });

      // Open the clicked item
      this.slideDown(serviceId);
    }
  }

  /**
   * Handle horizontal accordion mouse enter - converted from jQuery
   */
  onHorizontalItemMouseEnter(serviceId: string): void {
    const currentItems = this.horizontalAccordionItems();
    const hoveredItem = currentItems.find((item) => item.id === serviceId);

    if (!hoveredItem) return;

    // Update signal state first
    const updatedItems = currentItems.map((item) => ({
      ...item,
      isActive: item.id === serviceId,
      isOpen: item.id === serviceId,
    }));

    this.horizontalAccordionItems.set(updatedItems);
    this.activeHorizontalItem.set(serviceId);

    // Remove all classes from all items
    const allItems =
      this.elementRef.nativeElement.querySelectorAll('.tt-hac-item');
    allItems.forEach((item: Element) => {
      const htmlItem = item as HTMLElement;
      htmlItem.classList.remove('active', 'inactive');
    });

    // Find and add active class to the currently hovered item
    allItems.forEach((item: Element) => {
      const htmlItem = item as HTMLElement;
      const itemId = htmlItem.getAttribute('data-service-id');

      if (itemId === serviceId) {
        // This is the hovered item - make it active
        htmlItem.classList.add('active');
      } else {
        // All other items become inactive
        htmlItem.classList.add('inactive');
      }
    });
  }

  /**
   * Handle horizontal accordion mouse leave - converted from jQuery
   */
  onHorizontalItemMouseLeave(): void {
    const currentItems = this.horizontalAccordionItems();
    const updatedItems = currentItems.map((item) => ({
      ...item,
      isActive: false,
      isOpen: false,
    }));

    this.horizontalAccordionItems.set(updatedItems);
    this.activeHorizontalItem.set(null);

    // Remove all active/inactive classes and return to default state
    const allItems =
      this.elementRef.nativeElement.querySelectorAll('.tt-hac-item');
    allItems.forEach((item: Element) => {
      const htmlItem = item as HTMLElement;
      htmlItem.classList.remove('active', 'inactive');
    });
  }

  /**
   * Calculate horizontal accordion content size - converted from jQuery
   */
  @HostListener('window:resize')
  @HostListener('window:orientationchange')
  onWindowResize(): void {
    if (this.resizeTimeout) {
      clearTimeout(this.resizeTimeout);
    }

    this.resizeTimeout = setTimeout(() => {
      this.calculateHorizontalAccordionSize();
    }, 100);
  }

  /**
   * Calculate and set horizontal accordion content width
   */
  private calculateHorizontalAccordionSize(): void {
    setTimeout(() => {
      const firstItem = this.elementRef.nativeElement.querySelector(
        '.tt-hac-item:first-child'
      );
      if (!firstItem) return;

      const itemInner = firstItem.querySelector(
        '.tt-hac-item-inner'
      ) as HTMLElement;
      if (!itemInner) return;

      const innerWidth = itemInner.offsetWidth * 0.84;
      const contentElements = this.elementRef.nativeElement.querySelectorAll(
        '.tt-haci-title, .tt-haci-description'
      );

      contentElements.forEach((element: Element) => {
        const htmlElement = element as HTMLElement;
        this.renderer.setStyle(htmlElement, 'width', `${innerWidth}px`);
      });
    }, 500);
  }

  /**
   * Slide down animation (replaces jQuery slideDown)
   */
  private slideDown(serviceId: string): void {
    const element = this.elementRef.nativeElement.querySelector(
      `[data-service-id="${serviceId}"] .tt-accordion-content`
    ) as HTMLElement;
    if (!element) return;

    this.renderer.setStyle(element, 'display', 'block');
    this.renderer.setStyle(element, 'height', '0px');
    this.renderer.setStyle(element, 'overflow', 'hidden');
    this.renderer.setStyle(element, 'transition', 'height 350ms ease');

    setTimeout(() => {
      const height = element.scrollHeight;
      this.renderer.setStyle(element, 'height', `${height}px`);

      setTimeout(() => {
        this.renderer.removeStyle(element, 'height');
        this.renderer.removeStyle(element, 'overflow');
        this.renderer.removeStyle(element, 'transition');
      }, 350);
    }, 10);
  }

  /**
   * Slide up animation (replaces jQuery slideUp)
   */
  private slideUp(serviceId: string): void {
    const element = this.elementRef.nativeElement.querySelector(
      `[data-service-id="${serviceId}"] .tt-accordion-content`
    ) as HTMLElement;
    if (!element) return;

    const height = element.offsetHeight;
    this.renderer.setStyle(element, 'height', `${height}px`);
    this.renderer.setStyle(element, 'overflow', 'hidden');
    this.renderer.setStyle(element, 'transition', 'height 350ms ease');

    setTimeout(() => {
      this.renderer.setStyle(element, 'height', '0px');

      setTimeout(() => {
        this.renderer.setStyle(element, 'display', 'none');
        this.renderer.removeStyle(element, 'height');
        this.renderer.removeStyle(element, 'overflow');
        this.renderer.removeStyle(element, 'transition');
      }, 350);
    }, 10);
  }

  /**
   * Update accordion item state
   */
  private updateAccordionItemState(
    serviceId: string,
    isActive: boolean,
    isOpen: boolean
  ): void {
    const currentItems = this.accordionItems();
    const updatedItems = currentItems.map((item) =>
      item.id === serviceId ? { ...item, isActive, isOpen } : item
    );
    this.accordionItems.set(updatedItems);
  }

  /**
   * Get item ID from DOM element
   */
  private getItemIdFromElement(element: HTMLElement): string | null {
    const dataId = element.getAttribute('data-service-id');
    return dataId ? dataId : null;
  }

  /**
   * Check if accordion item is active
   */
  isAccordionItemActive(serviceId: string): boolean {
    return (
      this.accordionItems().find((item) => item.id === serviceId)?.isActive ||
      false
    );
  }

  /**
   * Check if horizontal accordion item is active
   */
  isHorizontalItemActive(serviceId: string): boolean {
    return (
      this.horizontalAccordionItems().find((item) => item.id === serviceId)
        ?.isActive || false
    );
  }
}
