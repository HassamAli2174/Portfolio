import { Component, inject } from '@angular/core';

import { PortfolioService } from '../../core/portfolio.service';
import { RevealDirective } from '../../shared/reveal.directive';

@Component({
  selector: 'app-resume',
  imports: [RevealDirective],
  templateUrl: './resume.component.html',
  styleUrl: './resume.component.scss',
})
export class ResumeComponent {
  protected readonly portfolio = inject(PortfolioService).portfolio;
}
