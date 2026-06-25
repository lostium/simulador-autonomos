import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal, PLATFORM_ID } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { TaxData } from '../models/tax-data.model';
import { catchError, firstValueFrom, of, shareReplay, tap } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class TaxConfigService {
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);
  
  private _config = signal<TaxData | null>(null);
  config = this._config.asReadonly();

  async load() {
      if (!isPlatformBrowser(this.platformId)) {
          return;
      }
      try {
          const data = await firstValueFrom(
            this.http.get<TaxData>('config/tax-data.json').pipe(
                catchError(err => {
                    console.error('Failed to load tax config', err);
                    return of(null);
                })
            )
          );
          if (data) {
              this._config.set(data);
          }
      } catch (e) {
          // Ignore error
      }
  }
}
