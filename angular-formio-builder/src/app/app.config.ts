import { ApplicationConfig, provideZoneChangeDetection, isDevMode } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptorsFromDi } from '@angular/common/http';
import { importProvidersFrom } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { provideAnimations } from '@angular/platform-browser/animations';
import { withInMemoryScrolling } from '@angular/router';

import { routes } from './app.routes';

// Configuración para el entorno del navegador
export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ 
      eventCoalescing: true,
      runCoalescing: true
    }),
    provideRouter(
      routes,
      withInMemoryScrolling({
        scrollPositionRestoration: 'enabled',
        anchorScrolling: 'enabled'
      })
    ),
    provideAnimations(),
    provideHttpClient(
      withFetch(),
      withInterceptorsFromDi()
    ),
    importProvidersFrom(
      FormsModule,
      ReactiveFormsModule,
      DragDropModule
    ),
    // Configuración adicional para desarrollo
    { provide: 'isDevMode', useFactory: isDevMode }
  ]
};
