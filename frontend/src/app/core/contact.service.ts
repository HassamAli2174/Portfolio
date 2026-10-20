import { HttpClient } from '@angular/common/http';
import { DOCUMENT, InjectionToken, Injectable, inject } from '@angular/core';
import { Observable, map, of } from 'rxjs';

import { environment } from '../../environments/environment';
import { ContactMessage } from './portfolio.models';
import { PortfolioService } from './portfolio.service';

export const WEB3FORMS_ACCESS_KEY = new InjectionToken<string>('WEB3FORMS_ACCESS_KEY', {
  providedIn: 'root',
  factory: () => environment.web3formsAccessKey,
});

const WEB3FORMS_URL = 'https://api.web3forms.com/submit';

interface Web3FormsResponse {
  success: boolean;
  message: string;
}

/** How a message is delivered: straight to the inbox, or via the visitor's email app. */
export type ContactMode = 'web3forms' | 'mailto';

@Injectable({ providedIn: 'root' })
export class ContactService {
  private readonly http = inject(HttpClient);
  private readonly document = inject(DOCUMENT);
  private readonly accessKey = inject(WEB3FORMS_ACCESS_KEY);
  private readonly profile = inject(PortfolioService).profile;

  readonly mode: ContactMode = this.accessKey ? 'web3forms' : 'mailto';

  send(message: ContactMessage): Observable<void> {
    // Honeypot filled in: pretend success so bots get no signal.
    if (message.website) return of(undefined);

    if (this.mode === 'mailto') {
      this.openMailClient(this.mailtoUrl(message));
      return of(undefined);
    }

    return this.http
      .post<Web3FormsResponse>(
        WEB3FORMS_URL,
        {
          access_key: this.accessKey,
          subject: `[Portfolio] ${message.subject}`,
          from_name: message.name,
          name: message.name,
          email: message.email,
          message: message.message,
        },
        { headers: { Accept: 'application/json' } },
      )
      .pipe(
        map((response) => {
          if (!response.success) throw new Error(response.message);
        }),
      );
  }

  mailtoUrl(message: ContactMessage): string {
    const subject = encodeURIComponent(message.subject);
    const body = encodeURIComponent(`${message.message}\n\n${message.name}\n${message.email}`);
    return `mailto:${this.profile().email}?subject=${subject}&body=${body}`;
  }

  /** Separate so tests can replace the navigation. */
  openMailClient(url: string): void {
    this.document.location.href = url;
  }
}
