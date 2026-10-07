import { Component, inject } from '@angular/core';

import { PortfolioService } from '../../core/portfolio.service';

@Component({
  selector: 'app-resume',
  templateUrl: './resume.component.html',
  styleUrl: './resume.component.scss',
})
export class ResumeComponent {
  protected readonly portfolio = inject(PortfolioService).portfolio;
}
