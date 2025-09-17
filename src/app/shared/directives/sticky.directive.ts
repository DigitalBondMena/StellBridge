import { Directive, ElementRef, HostListener, Input, NgZone, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appSticky]'
})
export class StickyDirective {

   @Input() stickyTop = 0; // المسافة من فوق
  @Input() stickyContainerSelector = ''; // الكونتينر اللي العنصر ما يطلعش بره
  @Input() stickyMinWidth = 0; // أقل عرض شاشة يشتغل عنده الـ sticky

  private containerEl!: HTMLElement | null;
  private containerTopPage = 0;
  private containerHeight = 0;
  private elHeight = 0;

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  ngOnInit(): void {
    if (this.stickyContainerSelector) {
      this.containerEl = document.querySelector(
        this.stickyContainerSelector
      ) as HTMLElement;
      if (this.containerEl) {
        this.calculateContainer();
      }
    }
    this.calculateElement();
    this.updatePosition();
  }

  @HostListener('window:scroll')
  @HostListener('window:resize')
  onScrollOrResize() {
    this.calculateContainer();
    this.calculateElement();
    this.updatePosition();
  }

  private calculateContainer() {
    if (this.containerEl) {
      const rect = this.containerEl.getBoundingClientRect();
      this.containerTopPage = rect.top + window.scrollY;
      this.containerHeight = this.containerEl.offsetHeight;
    }
  }

  private calculateElement() {
    this.elHeight = this.el.nativeElement.offsetHeight;
  }

  private updatePosition() {
    const scrollY = window.scrollY || window.pageYOffset;

    // ✅ شرط العرض
    if (window.innerWidth < this.stickyMinWidth) {
      this.resetToNormal();
      return;
    }

    if (!this.containerEl) {
      return;
    }

    // لو العنصر أطول من الكونتينر -> عادي
    if (this.elHeight >= this.containerHeight) {
      this.resetToNormal();
      return;
    }

    const topThreshold = this.containerTopPage;
    const bottomThreshold = this.containerTopPage + this.containerHeight;

    const shouldBeFixed =
      scrollY + this.stickyTop > topThreshold &&
      scrollY + this.stickyTop + this.elHeight < bottomThreshold;

    const shouldBeStuck =
      scrollY + this.stickyTop + this.elHeight >= bottomThreshold;

    if (shouldBeFixed) {
      this.renderer.setStyle(this.el.nativeElement, 'position', 'fixed');
      this.renderer.setStyle(this.el.nativeElement, 'top', `${this.stickyTop}px`);
      this.renderer.setStyle(this.el.nativeElement, 'bottom', 'auto');
      this.renderer.setStyle(this.el.nativeElement, 'width', `${this.el.nativeElement.offsetWidth}px`);
    } else if (shouldBeStuck) {
      this.renderer.setStyle(this.el.nativeElement, 'position', 'absolute');
      this.renderer.setStyle(
        this.el.nativeElement,
        'top',
        `${this.containerHeight - this.elHeight}px`
      );
      this.renderer.setStyle(this.el.nativeElement, 'width', '100%');
    } else {
      this.resetToNormal();
    }
  }

  private resetToNormal() {
    this.renderer.setStyle(this.el.nativeElement, 'position', 'static');
    this.renderer.removeStyle(this.el.nativeElement, 'top');
    this.renderer.removeStyle(this.el.nativeElement, 'bottom');
    this.renderer.removeStyle(this.el.nativeElement, 'width');
  }

}
