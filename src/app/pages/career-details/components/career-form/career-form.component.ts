import { ChangeDetectorRef, Component, effect, inject, input, signal, SimpleChanges } from '@angular/core';
import { Contact } from '../../../contact-us/res/contact-us';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CareerService } from '../../../career/res/career.service';


@Component({
  selector: 'app-career-form',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './career-form.component.html',
  styleUrl: './career-form.component.css'
})
export class CareerFormComponent {
  isSubmitting = signal<boolean>(false);
  submitStatus = signal<'success' | 'error' | null>(null);
  jopTitle = input<string | undefined>('');
  private readonly fb = inject(FormBuilder);
  private readonly careerService = inject(CareerService);
  contactUs = input<Contact>({} as Contact);
  fileName = signal<string>('');
  formData = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, Validators.pattern(/^5\d{8}$/)]],
    jop_title: ['', [Validators.required, Validators.minLength(3)]],
    current_salary: ['', [Validators.required, Validators.pattern(/^\d+$/)]],
    experience: ['', [Validators.required, Validators.pattern(/^\d+$/)]],
    expected_salary: ['', [Validators.required, Validators.pattern(/^\d+$/)]],
    cover_leter: ['', [Validators.required, Validators.minLength(3)]], // ✨ هنا نخليها نص بس
    jop_cv: [null, [Validators.required, this.fileValidator]] // ✨ هنا يتحط الـ validator بتاع الملف
  });
  constructor() {
    // 🟢 effect بيربط signal بالـ formControl
    effect(() => {
      const title = this.jopTitle();
      if (title) {
        this.formData.get('jop_title')?.setValue(title);
      }
    });
  }
  fileValidator(control: any) {
    const file = control.value;
    console.log(file);

    if (file) {
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
      if (!allowedTypes.includes(file.type)) {
        return { fileType: true }
      }
      if (file.size > 2 * 1024 * 1024) {
        return { fileSize: true }
      }
    }
    return null
  }

  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.formData.patchValue({ jop_cv: file });
      this.fileName.set(file.name);
      this.formData.get('jop_cv')?.updateValueAndValidity();
    }
    this.formData.get('jop_cv')?.markAsDirty();
  }



  isFormValid() {
    return this.formData.valid;
  }

  onBookingSubmit() {
    if (this.formData.invalid) {
      this.formData.markAllAsTouched();
      this.formData.markAsDirty();
      return
    };

    this.isSubmitting.set(true);
    this.submitStatus.set(null);

    const formDataToSend = new FormData();
    formDataToSend.append('name', this.formData.get('name')?.value || '');
    formDataToSend.append('email', this.formData.get('email')?.value || '');
    formDataToSend.append('phone', this.formData.get('phone')?.value || '');
    formDataToSend.append('jop_title', this.formData.get('jop_title')?.value || '');
    formDataToSend.append('current_salary', this.formData.get('current_salary')?.value || '');
    formDataToSend.append('experience', this.formData.get('experience')?.value || '');
    formDataToSend.append('expected_salary', this.formData.get('expected_salary')?.value || '');
    formDataToSend.append('cover_leter', this.formData.get('cover_leter')?.value || '');

    const cvFile = this.formData.get('jop_cv')?.value;
    if (cvFile) {
      formDataToSend.append('jop_cv', cvFile);
    }
    this.careerService.postCareerForm(formDataToSend).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.submitStatus.set('success');
        this.formData.reset();
      },
      error: (err) => {
        console.error('❌ Error:', err);
        this.isSubmitting.set(false);
        this.submitStatus.set('error');
      }
    })
  }
}

