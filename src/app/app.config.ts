import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideIonicAngular } from '@ionic/angular';
import { provideHttpClient } from '@angular/common/http';
import { routes } from './app.routes';
import { DATA_PROVIDERS } from './core/providers/data';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideIonicAngular({ mode: 'md' }),
    provideHttpClient(),   // listo para cuando enchufes el adapter HTTP
    ...DATA_PROVIDERS,
  ],
};