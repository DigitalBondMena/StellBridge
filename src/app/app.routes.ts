import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';

export const routes: Routes = [
  /* Home page  */
  { path: '', component: HomeComponent, pathMatch: 'full' },

  /* Services page  */
  {
    path: 'services',
    loadComponent: () =>
      import('./pages/services/services.component').then(
        (m) => m.ServicesComponent
      ),
  },
  /* Projects page  */
  {
    path: 'projects',
    loadComponent: () =>
      import('./pages/project/project.component').then(
        (m) => m.ProjectComponent
      ),
  },
  /* Project page  */
  {
    path: 'project-details/:id',
    loadComponent: () =>
      import('./pages/project-details/project-details.component').then(
        (m) => m.ProjectDetailsComponent
      ),
  },

  /* Services page  */
  {
    path: 'service-details/:slug',
    loadComponent: () =>
      import('./pages/service-details/service-details.component').then(
        (m) => m.ServiceDetailsComponent
      ),
  },

  /* Achievements page  */
  {
    path: 'achievements',
    loadComponent: () =>
      import('./pages/achievements/achievements.component').then(
        (m) => m.AchievementsComponent
      ),
  },

  /* Contact us page  */
  {
    path: 'contact-us',
    loadComponent: () =>
      import('./pages/contact-us/contact-us.component').then(
        (m) => m.ContactUsComponentMain
      ),
  },
  /* Privacy page  */

  {
    path: 'privacy',
    loadComponent: () =>
      import('./pages/privacy/privacy.component').then(
        (m) => m.PrivacyComponent
      ),
  },

  /* About page  */
  {
    path: 'about-us',
    loadComponent: () =>
      import('./pages/about/about.component').then((m) => m.AboutComponent),
  },

  /* 404 page  */
  { path: '**', redirectTo: '' },
];
