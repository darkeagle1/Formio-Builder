import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class FormioLoaderService {
  private formioLoaded = false;
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  async loadFormio(): Promise<any> {
    if (!this.isBrowser) {
      return null;
    }

    if (this.formioLoaded && (window as any).Formio) {
      return (window as any).Formio;
    }

    try {
      // Cargar Form.io desde CDN para evitar problemas de SSR
      await this.loadFormioFromCDN();
      this.formioLoaded = true;
      return (window as any).Formio;
    } catch (error) {
      console.error('Error loading Form.io from CDN:', error);
      return null;
    }
  }

  private loadFormioFromCDN(): Promise<void> {
    return new Promise((resolve, reject) => {
      if ((window as any).Formio) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/@formio/js@latest/dist/formio.full.min.js';
      script.onload = () => {
        if ((window as any).Formio) {
          resolve();
        } else {
          reject(new Error('Form.io failed to load'));
        }
      };
      script.onerror = () => reject(new Error('Failed to load Form.io script'));
      document.head.appendChild(script);
    });
  }

  isFormioAvailable(): boolean {
    return this.isBrowser && this.formioLoaded;
  }
}
