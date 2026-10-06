import { Component, computed, inject } from '@angular/core';
import { DatePipe } from '@angular/common';

import { PortfolioService, yearsSince } from '../../core/portfolio.service';
import { CountUpComponent } from '../../shared/count-up.component';
import { InViewDirective } from '../../shared/in-view.directive';

@Component({
  selector: 'app-about',
  imports: [DatePipe, CountUpComponent, InViewDirective],
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss',
})
export class AboutComponent {
  protected readonly portfolio = inject(PortfolioService).portfolio;
  protected readonly age = computed(() => {
    const birthday = this.portfolio()?.profile.birthday;
    return birthday ? yearsSince(birthday) : null;
  });
}
