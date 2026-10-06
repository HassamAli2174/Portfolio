import { Routes } from '@angular/router';

const title = (section: string) => `${section} | Hassam Arshad`;

export const routes: Routes = [
  // Home is just the full-screen header; it has no content of its own.
  { path: '', pathMatch: 'full', children: [], title: 'Hassam Arshad | Software Engineer' },
  {
    path: 'about',
    title: title('About'),
    loadComponent: () => import('./pages/about/about.component').then((m) => m.AboutComponent),
  },
  {
    path: 'resume',
    title: title('Resume'),
    loadComponent: () => import('./pages/resume/resume.component').then((m) => m.ResumeComponent),
  },
  {
    path: 'portfolio',
    title: title('Portfolio'),
    loadComponent: () => import('./pages/portfolio/portfolio.component').then((m) => m.PortfolioComponent),
  },
  {
    // The page sets its own title once the project has loaded.
    path: 'portfolio/:slug',
    loadComponent: () =>
      import('./pages/project-detail/project-detail.component').then((m) => m.ProjectDetailComponent),
  },
  {
    path: 'contact',
    title: title('Contact'),
    loadComponent: () => import('./pages/contact/contact.component').then((m) => m.ContactComponent),
  },
  { path: '**', redirectTo: '' },
];
