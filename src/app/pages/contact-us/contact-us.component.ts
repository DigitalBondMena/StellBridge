import {
  animate,
  query,
  stagger,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  Component,
  inject,
  OnInit,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { LandingSectionComponent } from '../home/components/landing-section/landing-section.component';
import { IContactUsForm } from './res/contact-us';
import { ContactUsService } from './res/contact-us.service';

@Component({
  selector: 'app-contact-us-main',
  imports: [CommonModule, ReactiveFormsModule, LandingSectionComponent],
  templateUrl: './contact-us.component.html',
  styleUrl: './contact-us.component.css',
  animations: [
    trigger('slideUpStagger', [
      transition('* => *', [
        query(
          '.animate-item',
          [
            style({
              opacity: 0,
              transform: 'translateY(50px)',
            }),
            stagger(100, [
              animate(
                '0.6s ease-out',
                style({
                  opacity: 1,
                  transform: 'translateY(0)',
                })
              ),
            ]),
          ],
          { optional: true }
        ),
      ]),
    ]),
    trigger('slideUp', [
      state(
        'hidden',
        style({
          opacity: 0,
          transform: 'translateY(50px)',
        })
      ),
      state(
        'visible',
        style({
          opacity: 1,
          transform: 'translateY(0)',
        })
      ),
      transition('hidden => visible', [animate('0.6s ease-out')]),
    ]),
    trigger('fadeInUp', [
      state(
        'hidden',
        style({
          opacity: 0,
          transform: 'translateY(30px)',
        })
      ),
      state(
        'visible',
        style({
          opacity: 1,
          transform: 'translateY(0)',
        })
      ),
      transition('hidden => visible', [animate('0.8s 0.3s ease-out')]),
    ]),
  ],
})
export class ContactUsComponentMain implements OnInit, AfterViewInit {
  // Animation state signals
  headerAnimationState = signal<'hidden' | 'visible'>('hidden');
  formAnimationState = signal<'hidden' | 'visible'>('hidden');
  formItemsAnimationState = signal<number>(0);

  private contactService = inject(ContactUsService);

  private platformId = inject(PLATFORM_ID);

  private fb = inject(FormBuilder);

  submitSuccess = signal(false);

  // Computed values
  formData = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    address: ['', Validators.required],
    phone: [
      '',
      [Validators.required, Validators.pattern(/^\+?[0-9\s\-()]{8,}$/)],
    ],
    message: ['', [Validators.required, Validators.minLength(10)]],
  }); // Direct signal reference for better SSR compatibility

  ngOnInit(): void {
    // Only run animations on the client side
    if (isPlatformBrowser(this.platformId)) {
      this.initializeAnimations();
    } else {
      // For SSR, set everything to visible immediately
      this.headerAnimationState.set('visible');
      this.formAnimationState.set('visible');
      this.formItemsAnimationState.set(1);
    }
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      // Trigger animations after view is ready
      setTimeout(() => {
        this.startAnimations();
      }, 200);
    }
  }

  private initializeAnimations(): void {
    // Set initial animation states
    this.headerAnimationState.set('hidden');
    this.formAnimationState.set('hidden');
    this.formItemsAnimationState.set(0);
  }

  private startAnimations(): void {
    // Animate header first
    setTimeout(() => {
      this.headerAnimationState.set('visible');
    }, 100);

    // Then animate form container
    setTimeout(() => {
      this.formAnimationState.set('visible');
    }, 400);

    // Finally trigger staggered form items animation
    setTimeout(() => {
      this.formItemsAnimationState.set(1);
    }, 700);
  }

  // Form submission handler
  onFormSubmit(): void {
    if (this.formData.invalid) {
      this.formData.markAllAsTouched();
      return;
    }

    this.contactService
      .ContactUsForm(this.formData.value as IContactUsForm)
      .subscribe({
        next: (next) => {
          if (next.success) {
            this.formData.reset();
            this.submitSuccess.set(true);

            // Auto-close popup after 5 seconds
            setTimeout(() => {
              this.submitSuccess.set(false);
            }, 2000);
          }
        },
        error: (error) => {
          console.log(error);
          this.submitSuccess.set(false);
        },
      });
  }

  // Add method to close popup
  closeSuccessPopup(): void {
    this.submitSuccess.set(false);
  }

  // Add method to handle click outside
  onPopupOutsideClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (target.classList.contains('success-popup')) {
      this.closeSuccessPopup();
    }
  }
}
