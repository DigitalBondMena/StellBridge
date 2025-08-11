# Angular Component Structure Analysis

## 🌐 GLOBAL/SHARED ELEMENTS (Keep in App Component or Shared Services)

### 1. Layout Wrapper

```html
<main id="body-inner"><!-- Keep in app.component.html --></main>
```

### 2. Page Transition (Global Service/Component)

```html
<div id="tt-page-transition">
  <div class="tt-ptr-overlay-top tt-noise"></div>
  <div class="tt-ptr-overlay-bottom tt-noise"></div>
  <div class="tt-ptr-preloader">
    <!-- Move to shared/components/page-transition/ -->
  </div>
</div>
```

### 3. Magic Cursor (Global Service/Component)

```html
<div id="magic-cursor">
  <div id="ball"></div>
</div>
<!-- Move to shared/components/magic-cursor/ -->
```

### 4. Header (Shared Component)

```html
<header id="tt-header" class="tt-header-alter tt-header-scroll tt-header-filled">
  <!-- Move to shared/components/header/ -->
</header>
```

### 5. Footer (Shared Component)

```html
<footer id="tt-footer" class="border-top">
  <!-- Move to shared/components/footer/ -->
</footer>
```

### 6. Scroll to Top (Global Service/Component)

```html
<a href="#" class="tt-scroll-to-top">
  <!-- Move to shared/components/scroll-to-top/ -->
</a>
```

---

## 🏠 HOME PAGE SPECIFIC COMPONENTS

### Content Wrapper (Keep in home.component.html)

```html
<div id="tt-content-wrap">
  <!-- This wraps all home page content -->
</div>
```

### Page Content Container (Keep in home.component.html)

```html
<div id="tt-page-content">
  <!-- This wraps all sections below hero -->
</div>
```

---

## 📋 INDIVIDUAL COMPONENTS BREAKDOWN

### 1. **Hero Section Component**

http://localhost:4200/#tt-page-content
**Path:** `src/app/pages/home/components/hero-section/`

```html
<div id="page-header" class="ph-full ph-full-m ph-center ph-cap-xxxxlg ph-image-parallax ph-caption-parallax">
  <!-- Background video/image -->
  <!-- Caption with title/subtitle -->
  <!-- Social buttons -->
  <!-- Scroll down indicator -->
</div>
```

**Features:**

- Video background
- Text mask effect
- Social media links
- Scroll indicator

### 2. **About Section Component**

**Path:** `src/app/pages/home/components/about-section/`

```html
<div class="tt-section padding-top-xlg-140 padding-bottom-xlg-120">
  <!-- About me content with heading and description -->
</div>
```

### 3. **Featured Work Header Component**

**Path:** `src/app/pages/home/components/featured-work-header/`

```html
<div class="tt-section padding-top-xlg-140 border-top">
  <!-- "Featured Work" heading with round button -->
</div>
```

### 4. **Portfolio Preview Component**

**Path:** `src/app/pages/home/components/portfolio-preview/`

```html
<div class="tt-section no-padding-top padding-top-xlg-80 padding-bottom-20 padding-bottom-xlg-80">
  <!-- Portfolio items list -->
</div>
```

**Features:**

- Portfolio items with images/videos
- Hover effects
- Dynamic content loading

### 5. **Scrolling Text Component**

**Path:** `src/app/pages/home/components/scrolling-text/`

```html
<div class="tt-section no-padding padding-top-xlg-40 padding-bottom-xlg-40">
  <!-- Crossed scrolling text animation -->
</div>
```

### 6. **Services Header Component**

**Path:** `src/app/pages/home/components/services-header/`

```html
<div class="tt-section no-padding-bottom padding-bottom-xlg-80">
  <!-- "What I Do" heading with arrow -->
</div>
```

### 7. **Services Accordion Component**

**Path:** `src/app/pages/home/components/services-accordion/`

```html
<div class="tt-section">
  <!-- Horizontal accordion with services -->
</div>
```

**Features:**

- Interactive accordion
- Hover effects
- Service descriptions

### 8. **Video Clipper Component**

**Path:** `src/app/pages/home/components/video-clipper/`

```html
<div class="tt-section no-padding-top">
  <!-- Video with overlay and play button -->
</div>
```

### 9. **Testimonials Component**

**Path:** `src/app/pages/home/components/testimonials/`

```html
<div class="tt-section border-bottom">
  <!-- Sticky testimonials with scroll effect -->
</div>
```

**Features:**

- Sticky scroll effect
- Multiple testimonial cards

### 10. **Awards Header Component**

**Path:** `src/app/pages/home/components/awards-header/`

```html
<div class="tt-section padding-top-xlg-120 no-padding-bottom">
  <!-- Awards section heading -->
</div>
```

### 11. **Awards List Component**

**Path:** `src/app/pages/home/components/awards-list/`

```html
<div class="tt-section">
  <!-- Awards list with hover effects -->
</div>
```

### 12. **Contact Section Component**

**Path:** `src/app/pages/home/components/contact-section/`

```html
<div class="tt-section padding-top-xlg-120 padding-bottom-xlg-120">
  <!-- Contact heading with round button -->
</div>
```

---

## 🗑️ ELEMENTS TO DELETE/REFACTOR

### 1. **Redundant Wrapper Divs**

- Multiple `.tt-section-inner` wrappers can be simplified
- Some `.tt-wrap` containers are redundant
- Excessive `.tt-col` nesting in simple layouts

### 2. **Hard-coded Content**

```html
<!-- Replace with data binding -->
<h1 class="ph-caption-title">Jesper<br />Dietrich</h1>
<!-- Should be -->
<h1 class="ph-caption-title">{{ heroTitle }}</h1>
```

### 3. **Inline Styles and Classes**

- Move complex class combinations to component CSS
- Create utility classes for repeated patterns

### 4. **Static Links**

```html
<!-- Replace with Angular Router -->
<a href="about-me.html">About</a>
<!-- Should be -->
<a routerLink="/about">About</a>
```

---

## 🔄 SHARED/REUSABLE COMPONENTS TO CREATE

### 1. **TT-Heading Component**

**Path:** `src/app/shared/components/tt-heading/`

```typescript
@Input() size: 'xsm' | 'sm' | 'lg' | 'xlg' | 'xxlg' | 'xxxlg' = '';
@Input() center: boolean = false;
@Input() subtitle: string = '';
@Input() title: string = '';
@Input() description: string = '';
```

### 2. **TT-Button Component**

**Path:** `src/app/shared/components/tt-button/`

```typescript
@Input() type: 'primary' | 'secondary' | 'outline' = 'primary';
@Input() magnetic: boolean = true;
@Input() href: string = '';
@Input() routerLink: string = '';
```

### 3. **TT-Section Component**

**Path:** `src/app/shared/components/tt-section/`

```typescript
@Input() paddingTop: string = '';
@Input() paddingBottom: string = '';
@Input() borderTop: boolean = false;
@Input() borderBottom: boolean = false;
```

---

## 📁 RECOMMENDED FOLDER STRUCTURE

```
src/app/
├── shared/
│   ├── components/
│   │   ├── header/
│   │   ├── footer/
│   │   ├── page-transition/
│   │   ├── magic-cursor/
│   │   ├── scroll-to-top/
│   │   ├── tt-heading/
│   │   ├── tt-button/
│   │   └── tt-section/
│   └── services/
│       ├── animation.service.ts
│       ├── cursor.service.ts
│       └── scroll.service.ts
├── pages/
│   └── home/
│       ├── home.component.ts
│       ├── home.component.html
│       ├── home.component.css
│       └── components/
│           ├── hero-section/
│           ├── about-section/
│           ├── featured-work-header/
│           ├── portfolio-preview/
│           ├── scrolling-text/
│           ├── services-header/
│           ├── services-accordion/
│           ├── video-clipper/
│           ├── testimonials/
│           ├── awards-header/
│           ├── awards-list/
│           └── contact-section/
└── app.component.html (global elements)
```

---

## 🎯 IMPLEMENTATION PRIORITY

### Phase 1 (Essential)

1. Create shared components (header, footer, tt-heading, tt-button)
2. Set up home component structure
3. Implement hero section

### Phase 2 (Content)

1. About section
2. Portfolio preview
3. Services accordion

### Phase 3 (Interactive)

1. Scrolling text animations
2. Video clipper
3. Testimonials with sticky scroll

### Phase 4 (Polish)

1. Awards list
2. Contact section
3. Global services (cursor, animations)

---

## 📝 NOTES

- Use Angular signals for reactive data
- Implement lazy loading for heavy components
- Use Angular CDK for animations and interactions
- Convert jQuery-dependent features to Angular equivalents
- Implement proper TypeScript interfaces for all data
- Use Angular Router for navigation
- Implement proper error handling and loading states
