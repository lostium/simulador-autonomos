import { Pipe, PipeTransform, inject, DEFAULT_CURRENCY_CODE, LOCALE_ID } from '@angular/core';
import { CurrencyPipe } from '@angular/common';

/**
 * A generic currency pipe that defaults to 2 decimal places ('1.2-2')
 * and uses the application's default currency code if none is provided.
 * 
 * Usage: {{ value | appCurrency }} or {{ value | appCurrency:'USD' }}
 */
@Pipe({
  name: 'appCurrency',
  standalone: true,
})
export class AppCurrencyPipe implements PipeTransform {
  private currencyPipe = new CurrencyPipe(inject(LOCALE_ID));
  private defaultCurrencyCode = inject(DEFAULT_CURRENCY_CODE);

  transform(
    value: number | string | null | undefined,
    currencyCode?: string,
    display: string | boolean = 'symbol',
    digitsInfo: string = '1.2-2',
    locale?: string
  ): string | null {
    // If we want to use the local default locale, we might need to inject LOCALE_ID too
    // But CurrencyPipe handles null/undefined locale by using the provided one or global default.
    return this.currencyPipe.transform(
      value,
      currencyCode || this.defaultCurrencyCode,
      display,
      digitsInfo,
      locale
    );
  }
}
