import { TestBed } from '@angular/core/testing';
import { AppCurrencyPipe } from './app-currency.pipe';
import { DEFAULT_CURRENCY_CODE, LOCALE_ID } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';

describe('AppCurrencyPipe', () => {
  let pipe: AppCurrencyPipe;

  beforeEach(() => {
    registerLocaleData(localeEs);
    TestBed.configureTestingModule({
      providers: [
        AppCurrencyPipe,
        { provide: DEFAULT_CURRENCY_CODE, useValue: 'EUR' },
        { provide: LOCALE_ID, useValue: 'es' }
      ]
    });
    pipe = TestBed.inject(AppCurrencyPipe);
  });

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should format with default EUR and 2 decimals', () => {
    const result = pipe.transform(1234.5);
    // In 'es' locale, it should be something like "1.234,50 €" (depending on browser/node version)
    // We check for the essentials: the symbol and the decimals
    expect(result).toContain('1.234,50');
    expect(result).toContain('€');
  });

  it('should format with explicit USD and 2 decimals', () => {
    const result = pipe.transform(1234.5, 'USD');
    // For USD in 'es' locale, it might be "$1.234,50" or similar
    expect(result).toContain('1.234,50');
    expect(result).toContain('$');
  });

  it('should handle zero correctly', () => {
    const result = pipe.transform(0);
    expect(result).toContain('0,00');
  });

  it('should handle null/undefined gracefully', () => {
    expect(pipe.transform(null)).toBeNull();
    expect(pipe.transform(undefined)).toBeNull();
  });
});
