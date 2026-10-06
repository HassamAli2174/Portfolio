import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { PortfolioService } from '../../core/portfolio.service';

type Status = 'idle' | 'sending' | 'sent' | 'error';
type Field = 'name' | 'email' | 'subject' | 'message';

@Component({
  selector: 'app-contact',
  imports: [ReactiveFormsModule],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss',
})
export class ContactComponent {
  private readonly portfolioService = inject(PortfolioService);
  protected readonly profile = this.portfolioService.profile;

  // Limits mirror ContactRequest on the backend.
  protected readonly form = inject(NonNullableFormBuilder).group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(254)]],
    subject: ['', [Validators.required, Validators.maxLength(150)]],
    message: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(5000)]],
    website: [''], // honeypot, hidden from people
  });

  protected readonly status = signal<Status>('idle');
  protected readonly errorMessage = signal('');

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.status.set('sending');
    this.portfolioService.sendMessage(this.form.getRawValue()).subscribe({
      next: () => {
        this.status.set('sent');
        this.form.reset();
      },
      error: (error: HttpErrorResponse) => this.handleError(error),
    });
  }

  /** Message for a field, preferring the server's when it rejected the value. */
  protected fieldError(field: Field): string | null {
    const control = this.form.controls[field];
    if (!control.touched || control.valid) return null;
    const errors = control.errors ?? {};
    if (errors['server']) return errors['server'];
    if (errors['required']) return 'This field is required.';
    if (errors['email']) return 'Please enter a valid email address.';
    if (errors['minlength']) return `Please write at least ${errors['minlength'].requiredLength} characters.`;
    if (errors['maxlength']) return `Please keep it under ${errors['maxlength'].requiredLength} characters.`;
    return 'Please check this field.';
  }

  private handleError(error: HttpErrorResponse): void {
    this.status.set('error');
    const serverErrors: Record<string, string> | undefined = error.error?.errors;
    if (error.status === 400 && serverErrors) {
      for (const [field, message] of Object.entries(serverErrors)) {
        const control = this.form.get(field);
        control?.setErrors({ server: message });
        control?.markAsTouched();
      }
      this.errorMessage.set('Please check the highlighted fields.');
    } else {
      this.errorMessage.set(
        error.error?.detail ?? 'Your message could not be sent right now. Please email me directly.',
      );
    }
  }
}
