import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  PLATFORM_ID,
  ViewChild,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { IMAGE_BASE_URL } from '../../../core/env';
import { Project } from '../../../pages/home/res/home';
import { LibraryLoaderService } from '../../../services/library-loader.service';

@Component({
  selector: 'app-projects-shared',
  imports: [CommonModule, RouterLink],
  templateUrl: './projects-shared.component.html',
  styleUrl: './projects-shared.component.css',
})
export class ProjectsSharedComponent implements AfterViewInit, OnDestroy {
  private platformId = inject(PLATFORM_ID);
  private libraryLoader = inject(LibraryLoaderService);
  private isBrowser = computed(() => isPlatformBrowser(this.platformId));

  imageUrl = IMAGE_BASE_URL;
  // ViewChild references
  @ViewChild('previewElement', { static: false })
  previewElement?: ElementRef<HTMLElement>;

  projects = input<Project[]>([]);

  // Reactive state using signals
  private isMouseFollowEnabled = signal(false);
  private gsapInstance: any = null;
  private mouseFollowTween: any = null;
  private resizeHandler: (() => void) | null = null;

  async ngAfterViewInit(): Promise<void> {
    if (!this.isBrowser()) return;

    try {
      // Use the established library loader service
      const { gsap } = await this.libraryLoader.loadGSAP();
      if (!gsap) {
        console.warn('GSAP failed to load');
        return;
      }

      this.gsapInstance = gsap;

      // Initialize mouse follow functionality
      this.initializeMouseFollow();

      // Setup resize handler
      this.setupResizeHandler();
    } catch (error) {
      console.warn('GSAP initialization failed:', error);
    }
  }

  ngOnDestroy(): void {
    this.cleanup();
  }

  private initializeMouseFollow(): void {
    if (!this.isBrowser() || !this.gsapInstance) return;

    const previewElements = document.querySelectorAll('.tt-ppli-preview');
    if (previewElements.length === 0) return;

    this.handleMouseFollow();
  }

  private handleMouseFollow(): void {
    if (!this.isBrowser()) return;

    if (window.innerWidth >= 768) {
      this.enableMouseFollow();
    } else {
      this.disableMouseFollow();
    }
  }

  private enableMouseFollow(): void {
    if (!this.gsapInstance || this.isMouseFollowEnabled()) return;

    const previewElements = document.querySelectorAll('.tt-ppli-preview');
    if (previewElements.length === 0) return;

    const duration = 1;
    const ease = 'power3.out';

    previewElements.forEach((element: Element) => {
      const xTo = this.gsapInstance.quickTo(element, 'x', {
        duration,
        ease,
      });
      const yTo = this.gsapInstance.quickTo(element, 'y', {
        duration,
        ease,
      });

      this.gsapInstance.set(element, { xPercent: -50, yPercent: -50 });

      // Store the mouse move handler for cleanup
      const mouseMoveHandler = (e: MouseEvent) => {
        xTo(e.clientX);
        yTo(e.clientY);
      };

      // Type assertion for storing handler
      (element as any)._mouseMoveHandler = mouseMoveHandler;
      window.addEventListener('mousemove', mouseMoveHandler);
    });

    this.isMouseFollowEnabled.set(true);
  }

  private disableMouseFollow(): void {
    if (!this.gsapInstance || !this.isMouseFollowEnabled()) return;

    const previewElements = document.querySelectorAll('.tt-ppli-preview');

    previewElements.forEach((element: Element) => {
      // Type assertion for accessing stored handler
      const elementWithHandler = element as any;
      if (elementWithHandler._mouseMoveHandler) {
        window.removeEventListener(
          'mousemove',
          elementWithHandler._mouseMoveHandler
        );
        delete elementWithHandler._mouseMoveHandler;
      }
      this.gsapInstance.set(element, { clearProps: 'all' });
    });

    this.isMouseFollowEnabled.set(false);
  }

  private setupResizeHandler(): void {
    if (!this.isBrowser()) return;

    this.resizeHandler = () => this.handleMouseFollow();
    window.addEventListener('resize', this.resizeHandler);
  }

  private cleanup(): void {
    if (!this.isBrowser()) return;

    // Clean up mouse follow
    this.disableMouseFollow();

    // Clean up resize handler
    if (this.resizeHandler) {
      window.removeEventListener('resize', this.resizeHandler);
      this.resizeHandler = null;
    }

    // Clean up any remaining GSAP animations
    if (this.mouseFollowTween) {
      this.mouseFollowTween.kill();
      this.mouseFollowTween = null;
    }
  }

  // Host listeners for window events
  @HostListener('window:resize')
  onWindowResize(): void {
    if (this.isBrowser()) {
      this.handleMouseFollow();
    }
  }

  // Project item hover handlers
  onProjectMouseEnter(event: MouseEvent): void {
    if (!this.isBrowser()) return;

    const target = event.currentTarget as HTMLElement;
    const videos = target.querySelectorAll('video');

    videos.forEach((video: HTMLVideoElement) => {
      video.play().catch((error) => {
        console.warn('Video play failed:', error);
      });
    });
  }

  onProjectMouseLeave(event: MouseEvent): void {
    if (!this.isBrowser()) return;

    const target = event.currentTarget as HTMLElement;
    const videos = target.querySelectorAll('video');

    videos.forEach((video: HTMLVideoElement) => {
      video.pause();
    });
  }

  // Touch event handlers for mobile
  onProjectTouchStart(event: TouchEvent): void {
    this.onProjectMouseEnter(event as any);
  }

  onProjectTouchEnd(event: TouchEvent): void {
    this.onProjectMouseLeave(event as any);
  }
}
