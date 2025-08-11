# Element Placement Guide - Where to Move Each Div

## 🚨 CURRENT PROBLEM

Your `hero.component.html` currently contains **GLOBAL elements** that should NOT be in a component. Here's where to move them:

---

## 📍 ELEMENTS TO MOVE OUT OF `hero.component.html`

### 1. **Page Transition** (Lines 1-15)

```html
<!-- REMOVE FROM hero.component.html -->
<div id="tt-page-transition">
  <div class="tt-ptr-overlay-top tt-noise"></div>
  <div class="tt-ptr-overlay-bottom tt-noise"></div>
  <div class="tt-ptr-preloader">
    <div class="tt-ptr-prel-content">
      <img src="/img/logo-light.png" class="tt-ptr-prel-image" alt="Logo" />
    </div>
  </div>
</div>
```

**➡️ MOVE TO:** `src/app/app.component.html`
**Why:** This is a global page loading effect that should appear on ALL pages, not just home.

### 2. **Magic Cursor** (Lines 17-21)

```html
<!-- REMOVE FROM hero.component.html -->
<div id="magic-cursor">
  <div id="ball"></div>
</div>
```

**➡️ MOVE TO:** `src/app/app.component.html`
**Why:** This is a global cursor effect that should work across ALL pages.

### 3. **Scroll to Top Button** (Lines ~1560-1571)

```html
<!-- REMOVE FROM hero.component.html -->
<a href="#" class="tt-scroll-to-top">
  <div class="tt-stt-progress tt-magnetic-item">
    <svg class="tt-stt-progress-circle" width="100%" height="100%" viewBox="-1 -1 102 102">
      <path d="M50,1 a49,49 0 0,1 0,98 a49,49 0 0,1 0,-98"></path>
    </svg>
  </div>
</a>
```

**➡️ MOVE TO:** `src/app/app.component.html`
**Why:** This button should be available on ALL pages.

---

## 📁 WHAT STAYS IN `hero.component.html`

### ✅ Keep Only the Hero Section

```html
<div id="page-header" class="ph-full ph-full-m ph-center ph-cap-xxxxlg ph-image-parallax ph-caption-parallax">
  <!-- Video background -->
  <!-- Caption text -->
  <!-- Social buttons -->
  <!-- Scroll down indicator -->
</div>
```

---

## 📁 WHAT MOVES TO OTHER COMPONENTS

### From `tt-page-content` Div - Split Into Separate Components:

#### 1. **Featured Work Header** → `featured-work-header.component.html`

```html
<div class="tt-section padding-top-xlg-140 border-top">
  <!-- Featured Work heading and button -->
</div>
```

#### 2. **Portfolio Preview** → `portfolio-preview.component.html`

```html
<div class="tt-section no-padding-top padding-top-xlg-80 padding-bottom-20 padding-bottom-xlg-80">
  <!-- Portfolio items list -->
</div>
```

#### 3. **Scrolling Text** → `scrolling-text.component.html`

```html
<div class="tt-section no-padding padding-top-xlg-40 padding-bottom-xlg-40">
  <!-- Crossed scrolling text -->
</div>
```

#### 4. **Services Header** → `services-header.component.html`

```html
<div class="tt-section no-padding-bottom padding-bottom-xlg-80">
  <!-- Services heading with arrow -->
</div>
```

#### 5. **Services Accordion** → `services-accordion.component.html`

```html
<div class="tt-section">
  <!-- Horizontal accordion -->
</div>
```

#### 6. **Video Clipper** → `video-clipper.component.html`

```html
<div class="tt-section no-padding-top">
  <!-- Video with play overlay -->
</div>
```

#### 7. **Testimonials** → `testimonials.component.html`

```html
<div class="tt-section border-bottom">
  <!-- Sticky testimonials -->
</div>
```

#### 8. **Awards Header** → `awards-header.component.html`

```html
<div class="tt-section padding-top-xlg-120 no-padding-bottom">
  <!-- Awards heading -->
</div>
```

#### 9. **Awards List** → `awards-list.component.html`

```html
<div class="tt-section">
  <!-- Awards list -->
</div>
```

#### 10. **Contact Section** → `contact-section.component.html`

```html
<div class="tt-section padding-top-xlg-120 padding-bottom-xlg-120">
  <!-- Contact heading and button -->
</div>
```

---

## 🏗️ FINAL FILE STRUCTURE

### `src/app/app.component.html`

```html
<main id="body-inner">
  <!-- Page Transition (moved from hero) -->
  <div id="tt-page-transition">...</div>

  <!-- Magic Cursor (moved from hero) -->
  <div id="magic-cursor">...</div>

  <!-- Header (shared across all pages) -->
  <app-header></app-header>

  <!-- Router Outlet for page content -->
  <router-outlet></router-outlet>

  <!-- Footer (shared across all pages) -->
  <app-footer></app-footer>

  <!-- Scroll to Top (moved from hero) -->
  <a href="#" class="tt-scroll-to-top">...</a>
</main>
```

### `src/app/pages/home/home.component.html`

```html
<div id="tt-content-wrap">
  <!-- Hero Section Component -->
  <app-hero-section></app-hero-section>

  <div id="tt-page-content">
    <!-- Individual Section Components -->
    <app-featured-work-header></app-featured-work-header>
    <app-portfolio-preview></app-portfolio-preview>
    <app-scrolling-text></app-scrolling-text>
    <app-services-header></app-services-header>
    <app-services-accordion></app-services-accordion>
    <app-video-clipper></app-video-clipper>
    <app-testimonials></app-testimonials>
    <app-awards-header></app-awards-header>
    <app-awards-list></app-awards-list>
    <app-contact-section></app-contact-section>
  </div>
</div>
```

### `src/app/pages/home/components/hero-section/hero-section.component.html`

```html
<!-- ONLY the hero section content -->
<div id="page-header" class="ph-full ph-full-m ph-center ph-cap-xxxxlg ph-image-parallax ph-caption-parallax">
  <!-- Video background -->
  <!-- Caption with title/subtitle -->
  <!-- Social buttons -->
  <!-- Scroll down indicator -->
</div>
```

---

## 🎯 ACTION STEPS

1. **Create `app.component.html`** and move global elements there
2. **Rename current `hero.component.html`** to `hero-section.component.html` and keep only hero content
3. **Create `home.component.html`** to orchestrate all sections
4. **Create individual component files** for each section
5. **Update all imports and selectors** accordingly

This structure follows Angular best practices and ensures proper separation of concerns!
