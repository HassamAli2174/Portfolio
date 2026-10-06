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
  { path: '**', redirectTo: '' },
];
