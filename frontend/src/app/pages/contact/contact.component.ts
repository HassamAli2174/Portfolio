import { Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { ContactService } from '../../core/contact.service';
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
  private readonly contactService = inject(ContactService);
  protected readonly profile = inject(PortfolioService).profile;
  /** 'mailto' until a Web3Forms access key is configured. */
  protected readonly mode = this.contactService.mode;

  protected readonly form = inject(NonNullableFormBuilder).group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(254)]],
    subject: ['', [Validators.required, Validators.maxLength(150)]],
    message: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(5000)]],
    website: [''], // honeypot, hidden from people
  });

  protected readonly status = signal<Status>('idle');

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.status.set('sending');
    this.contactService.send(this.form.getRawValue()).subscribe({
      next: () => {
        this.status.set('sent');
        this.form.reset();
      },
      error: () => this.status.set('error'),
    });
  }

  protected fieldError(field: Field): string | null {
    const control = this.form.controls[field];
    if (!control.touched || control.valid) return null;
    const errors = control.errors ?? {};
    if (errors['required']) return 'This field is required.';
    if (errors['email']) return 'Please enter a valid email address.';
    if (errors['minlength']) return `Please write at least ${errors['minlength'].requiredLength} characters.`;
    if (errors['maxlength']) return `Please keep it under ${errors['maxlength'].requiredLength} characters.`;
    return 'Please check this field.';
  }
}
