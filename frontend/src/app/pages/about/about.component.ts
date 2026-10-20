import { Component, computed, inject } from '@angular/core';
import { DatePipe } from '@angular/common';

import { PortfolioService, yearsSince } from '../../core/portfolio.service';
import { CountUpComponent } from '../../shared/count-up.component';
import { RevealDirective } from '../../shared/reveal.directive';

@Component({
  selector: 'app-about',
  imports: [RevealDirective, DatePipe, CountUpComponent],
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss',
})
export class AboutComponent {
  protected readonly portfolio = inject(PortfolioService).portfolio;
  protected readonly age = computed(() => {
    const birthday = this.portfolio()?.profile.birthday;
    return birthday ? yearsSince(birthday) : null;
  });

  /** Interest icons can be an icon-font class or a path/URL to a logo image. */
  protected isImage(icon: string): boolean {
    return /\.(svg|png|webp|jpe?g)$/i.test(icon);
  }
}
