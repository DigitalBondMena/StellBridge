import { computed, inject, Injectable, signal } from '@angular/core';
import { IBookCall } from '../../pages/contact-us/res/contact-us';
import { ContactUsService } from '../../pages/contact-us/res/contact-us.service';

export interface BookingFormData {
  name: string;
  email: string;
  phone: string;
  date: string;
}

@Injectable({
  providedIn: 'root',
})
export class BookingModalService {
  private contactUsService = inject(ContactUsService);

  // Modal state only (not form data)
  private isModalOpen = signal<boolean>(false);
  private isBookingSubmitting = signal<boolean>(false);
  private showSuccessPopup = signal<boolean>(false);

  // Store form reference
  private currentForm: any = null;

  // Computed values
  modalOpen = computed(() => this.isModalOpen());
  bookingSubmitting = computed(() => this.isBookingSubmitting());
  successPopupVisible = computed(() => this.showSuccessPopup());

  // Method to register the form
  registerForm(form: any): void {
    this.currentForm = form;
  }

  // Method to unregister the form
  unregisterForm(): void {
    this.currentForm = null;
  }

  // Modal control methods
  openBookingModal(): void {
    this.isModalOpen.set(true);

    // Reset form if available
    if (this.currentForm) {
      this.currentForm.reset();
    }

    // Prevent body scroll when modal is open
    if (typeof window !== 'undefined') {
      document.body.style.overflow = 'hidden';
    }
  }

  closeBookingModal(): void {
    this.isModalOpen.set(false);
    // Restore body scroll
    if (typeof window !== 'undefined') {
      document.body.style.overflow = 'auto';
    }
  }

  // Validate booking form data
  isBookingFormValid(formData: any): boolean {
    return !!(
      formData.name &&
      formData.email &&
      formData.phone &&
      formData.free_time
    );
  }

  // Booking form submission - accepts form data from reactive form
  onBookingSubmit(formData: any): void {
    console.log('Service: onBookingSubmit called with data:', formData);

    if (this.isBookingSubmitting()) {
      console.log('Service: Already submitting, returning early');
      return;
    }

    if (!this.isBookingFormValid(formData)) {
      console.log('Service: Form validation failed');
      return;
    }

    console.log('Service: Starting API call...');
    this.isBookingSubmitting.set(true);

    // Convert to IBookCall format and call actual API
    const bookingData: IBookCall = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      free_time: formData.free_time,
    };

    console.log('Service: Calling API with data:', bookingData);

    this.contactUsService.bookCall(bookingData).subscribe({
      next: (response) => {
        console.log(response);

        console.log('Service: API call successful:', response);
        // Close modal first
        this.closeBookingModal();

        // Show success popup
        this.showSuccessPopup.set(true);

        // Close success popup after 3000ms (3 seconds)
        setTimeout(() => {
          this.showSuccessPopup.set(false);
        }, 3000);
      },
      error: (error) => {
        console.error('Service: API call failed:', error);
        // You might want to show an error message here
      },
      complete: () => {
        console.log('Service: API call completed');
        this.isBookingSubmitting.set(false);
      },
    });
  }

  // Close modal when clicking outside
  onModalBackdropClick(event: Event): void {
    if (event.target === event.currentTarget) {
      this.closeBookingModal();
    }
  }

  // Get today's date for min date validation
  getTodayDate(): string {
    if (typeof window !== 'undefined') {
      return new Date().toISOString().split('T')[0];
    }
    return '';
  }
}
