# Sticky Animations Service & Directive

This Angular 19 implementation converts jQuery-based sticky animations to modern Angular using GSAP ScrollTrigger.

## Features

✅ **SSR Safe** - Uses `isPlatformBrowser()` checks  
✅ **Signal-based** - Reactive state management  
✅ **TypeScript** - Full type safety  
✅ **Mobile Responsive** - Automatically disables on mobile  
✅ **Memory Safe** - Proper cleanup on destroy  
✅ **Reusable** - Service + Directive pattern

## Services & Directives

### 1. StickyAnimationsService

Core service that handles sticky animations with GSAP ScrollTrigger.

```typescript
import { StickyAnimationsService } from "@core/services/sticky-animations.service";

export class YourComponent {
  private stickyAnimations = inject(StickyAnimationsService);

  async ngAfterViewInit() {
    await this.stickyAnimations.initializeAll();
  }

  ngOnDestroy() {
    this.stickyAnimations.destroy();
  }
}
```

### 2. StickyElementDirective

Reusable directive for individual elements.

```typescript
import { StickyElementDirective } from '@core/directives/sticky-element.directive';

@Component({
  imports: [StickyElementDirective],
  // ...
})
```

## Usage Examples

### Basic Sticky Element

```html
<!-- Simple sticky element -->
<div appStickyElement>
  <h2>This will stick to the top</h2>
</div>
```

### Custom Configuration

```html
<!-- Custom offset and settings -->
<div [appStickyElement]="{ offset: 100, markers: true }">
  <h2>Custom sticky element</h2>
</div>
```

### Complete Sticky Section

```html
<!-- Main container -->
<div class="tt-sticker">
  <div class="tt-row">
    <!-- Sticky sidebar -->
    <div class="tt-col-lg-4">
      <div class="tt-sticky-element">
        <h3>Sticky Sidebar</h3>
        <p>This content stays in place</p>
      </div>
    </div>

    <!-- Scrolling content -->
    <div class="tt-col-lg-8">
      <div class="tt-sticker-scroller">
        <!-- Long content that scrolls -->
        <div class="content">...</div>
      </div>
    </div>
  </div>
</div>
```

### Sticky Testimonials

```html
<!-- Stacking testimonials -->
<div class="tt-sticky-testimonials">
  @for (testimonial of testimonials(); track testimonial.id) {
  <div class="tt-stte-item">
    <div class="tt-stte-card">
      <p>{{ testimonial.text }}</p>
    </div>
  </div>
  }
</div>
```

## Configuration Options

### StickyConfig Interface

```typescript
interface StickyConfig {
  /** Custom offset from top (default: auto-calculated) */
  offset?: number;

  /** Whether to pin the element (default: true) */
  pin?: boolean;

  /** Custom start position (default: 'top center') */
  start?: string;

  /** Custom end position (default: 'bottom center') */
  end?: string;

  /** Enable markers for debugging (default: false) */
  markers?: boolean;

  /** Minimum screen width to enable (default: 992) */
  minWidth?: number;
}
```

### Usage with Configuration

```typescript
export class MyComponent {
  stickyConfig: StickyConfig = {
    offset: 80,
    markers: false,
    minWidth: 768,
  };
}
```

```html
<div [appStickyElement]="stickyConfig">Content</div>
```

## Required CSS Classes

The service looks for these specific CSS classes:

```css
/* Main sticky container */
.tt-sticker {
}

/* Element that gets pinned */
.tt-sticky-element {
}

/* Scrolling content area */
.tt-sticker-scroller {
}

/* Testimonials specific */
.tt-sticky-testimonials {
}
.tt-stte-item {
}
.tt-stte-card {
}
.tt-stp-item {
}

/* State classes (auto-added) */
.is-sticky-active {
}
```

## Header Integration

The service automatically detects header configuration:

```html
<!-- Fixed header -->
<header id="tt-header" class="tt-header-fixed">
  <div class="tt-header-inner">
    <!-- Header content -->
  </div>
</header>
```

Supported header classes:

- `.tt-header-fixed`
- `.tt-header-scroll`

## Methods

### Service Methods

```typescript
// Initialize all animations
await stickyAnimations.initializeAll();

// Reinitialize specific animations
await stickyAnimations.reinitializeStickerElements();
await stickyAnimations.reinitializeStickyTestimonials();

// Get current state
const state = stickyAnimations.getState();

// Cleanup
stickyAnimations.destroy();
```

### Directive Methods

```typescript
@ViewChild(StickyElementDirective)
stickyDirective!: StickyElementDirective;

// Refresh animation
await this.stickyDirective.refresh();

// Update configuration
await this.stickyDirective.updateConfig({ offset: 120 });

// Get state
const state = this.stickyDirective.getState();
```

## Component Integration Example

```typescript
import { Component, OnDestroy, AfterViewInit, inject } from "@angular/core";
import { StickyAnimationsService } from "@core/services/sticky-animations.service";
import { StickyElementDirective } from "@core/directives/sticky-element.directive";

@Component({
  selector: "app-page",
  standalone: true,
  imports: [StickyElementDirective],
  template: `
    <div class="tt-sticker">
      <!-- Sticky sidebar -->
      <div [appStickyElement]="{ offset: 100 }">
        <h3>Sticky Content</h3>
      </div>

      <!-- Scrolling content -->
      <div class="tt-sticker-scroller">
        <div class="long-content">...</div>
      </div>
    </div>
  `,
})
export class PageComponent implements AfterViewInit, OnDestroy {
  private stickyAnimations = inject(StickyAnimationsService);

  async ngAfterViewInit() {
    await this.stickyAnimations.initializeAll();
  }

  ngOnDestroy() {
    this.stickyAnimations.destroy();
  }
}
```

## Browser Support

- ✅ Modern browsers with GSAP support
- ✅ SSR compatible
- ✅ Mobile responsive (auto-disabled)
- ✅ Resize/orientation change handling

## Performance Notes

- Animations are automatically disabled on mobile (< 992px)
- ScrollTrigger instances are properly cleaned up
- Resize events are debounced (300ms)
- Uses `invalidateOnRefresh` for responsive behavior

## Debugging

Enable markers for debugging:

```typescript
const config = { markers: true };
```

Check animation state:

```typescript
console.log(stickyAnimations.getState());
```

## Migration from jQuery

### Before (jQuery)

```javascript
$(".tt-sticky-element").each(function () {
  // jQuery sticky logic
});
```

### After (Angular)

```typescript
// Service-based approach
await this.stickyAnimations.initializeAll();

// Or directive-based approach
<div appStickyElement>Content</div>;
```

## Best Practices

1. **Always cleanup** - Call `destroy()` in `ngOnDestroy`
2. **Use signals** - For reactive state management
3. **SSR safety** - Service handles platform checks
4. **Mobile first** - Animations auto-disable on mobile
5. **Performance** - Debounced resize handling
6. **Type safety** - Use provided interfaces
