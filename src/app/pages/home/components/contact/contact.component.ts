import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  Component,
  computed,
  inject,
  input,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Contact, IBookCall } from '../../../contact-us/res/contact-us';
import { ContactUsService } from '../../../contact-us/res/contact-us.service';
import { BookingModalService } from './../../../../shared/services/booking-modal.service';

@Component({
  selector: 'app-contact-us-alternate',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.css',
})
export class ContactComponent {
  private submitting = signal<boolean>(false);
  private submitStatus = signal<'success' | 'error' | null>(null);

  private fb = inject(FormBuilder);
  private contactUsService = inject(ContactUsService);
  private bookingModalService = inject(BookingModalService);
  private platformId = inject(PLATFORM_ID);

  contactUs = input<Contact>({} as Contact);

  isSubmitting = computed(() => this.submitting());
  submissionStatus = computed(() => this.submitStatus());

  // Computed values from booking modal service
  modalOpen = computed(() => this.bookingModalService.modalOpen());
  successPopupVisible = computed(() =>
    this.bookingModalService.successPopupVisible()
  );
  isBookingSubmitting = computed(() =>
    this.bookingModalService.bookingSubmitting()
  );

  // Form data for contact form (if needed for other purposes)
  formData = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, Validators.minLength(10)]],
    free_time: ['', Validators.required],
  });

  // Check if running in browser for SSR safety
  isBrowser = computed(() => isPlatformBrowser(this.platformId));

  // Booking modal methods - delegate to service
  openBookingModal(): void {
    if (this.isBrowser()) {
      this.bookingModalService.openBookingModal(() => {
        // Reset form when opening modal
        this.formData.reset();
      });
    }
  }

  closeBookingModal(): void {
    if (this.isBrowser()) {
      this.bookingModalService.closeBookingModal();
    }
  }

  isBookingFormValid(): boolean {
    return this.bookingModalService.isBookingFormValid(this.formData.value);
  }

  onModalBackdropClick(event: Event): void {
    this.bookingModalService.onModalBackdropClick(event);
  }

  getTodayDate(): string {
    return this.bookingModalService.getTodayDate();
  }

  // Booking form submission handler - passes reactive form data to service
  onBookingSubmit(): void {
    if (this.formData.invalid) {
      this.formData.markAllAsTouched();
      return;
    }

    const formData = this.formData.value;
    this.bookingModalService.onBookingSubmit(formData);
  }

  // Contact form submission handler (for future use if needed)
  onContactSubmit(): void {
    if (this.submitting()) {
      return;
    }

    if (this.formData.invalid) {
      this.formData.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.submitStatus.set(null);

    // Get current form data
    const data = this.formData.value;

    this.contactUsService.bookCall(data as IBookCall).subscribe({
      next: () => {
        this.submitStatus.set('success');
        this.formData.reset();
      },
      error: () => {
        this.submitStatus.set('error');
        this.formData.reset();
      },
      complete: () => {
        this.formData.reset();
        this.submitting.set(false);
      },
    });
  }
}
