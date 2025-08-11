import {
  Directive,
  ElementRef,
  OnDestroy,
  OnInit,
  Renderer2,
  effect,
  inject,
} from '@angular/core';
import { ThemeService } from '../../core/services/theme.service';

@Directive({
  selector: '[appThemeAware]',
  standalone: true,
})
export class ThemeAwareDirective implements OnInit, OnDestroy {
  private el = inject(ElementRef);
  private renderer = inject(Renderer2);
  private themeService = inject(ThemeService);

  ngOnInit() {
    // React to theme changes using Angular signals
    effect(() => {
      const currentTheme = this.themeService.currentTheme();
      this.updateElementForTheme(currentTheme);
    });
  }

  ngOnDestroy() {
    // Angular effects are automatically cleaned up
  }

  private updateElementForTheme(theme: 'light' | 'dark') {
    // Remove previous theme classes
    this.renderer.removeClass(this.el.nativeElement, 'theme-light');
    this.renderer.removeClass(this.el.nativeElement, 'theme-dark');

    // Add current theme class
    this.renderer.addClass(this.el.nativeElement, `theme-${theme}`);

    // Set data attribute for CSS
    this.renderer.setAttribute(this.el.nativeElement, 'data-theme', theme);
  }
}
