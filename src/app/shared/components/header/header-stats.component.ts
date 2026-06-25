import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { AppCurrencyPipe } from '@app/shared/pipes/app-currency.pipe';
import { SimulatorStore } from '@app/core/store/simulator.store';

@Component({
  selector: 'app-header-stats',
  imports: [AppCurrencyPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="stats-wrapper">
      @if (store.hasValidData() && store.results(); as res) {
        <div class="stats-container visible">
          <div class="stat-item">
            <span class="stat-label">Rendimiento Neto</span>
            <span class="stat-value text-cyan-400">{{ res.netRevenue - res.deductibleExpenses | appCurrency }}</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <span class="stat-label">Resultado</span>
            <span class="stat-value" 
                  [class.text-emerald-400]="res.balance <= 0" 
                  [class.text-rose-400]="res.balance > 0">
              {{ Math.abs(res.balance) | appCurrency }}
            </span>
          </div>
          @if (res.autonomousQuotaDiff < -1) {
            <div class="stat-divider"></div>
            <div class="stat-item">
              <span class="stat-label">Regularización RETA</span>
              <span class="stat-value text-rose-400">{{ Math.abs(res.autonomousQuotaDiff) | appCurrency }}</span>
            </div>
          }
        </div>
      } @else {
        <div class="stats-container placeholder">
          <div class="stat-item">
            <span class="stat-label">&nbsp;</span>
            <span class="stat-value">&nbsp;</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <span class="stat-label">&nbsp;</span>
            <span class="stat-value">&nbsp;</span>
          </div>
        </div>
      }
    </div>
  `,
  styles: `
    @reference "tailwindcss";

    .stats-wrapper {
      @apply hidden lg:block;
    }

    .stats-container {
      @apply flex items-center gap-4 px-5 py-3 rounded-2xl;
      background: var(--glass-bg);
      border: 1px solid var(--glass-border);
      backdrop-filter: blur(10px);
      transition: background 0.3s ease, border-color 0.3s ease, opacity 0.3s ease;
    }

    .stats-container.placeholder {
      opacity: 0;
      pointer-events: none;
    }

    .stats-container.visible {
      opacity: 1;
    }

    .stat-item {
      @apply flex flex-col;
    }

    .stat-label {
      @apply text-[10px] uppercase font-bold tracking-wider leading-none mb-1;
      color: var(--color-text-muted);
      min-height: 12px;
    }

    .stat-value {
      @apply font-mono font-bold text-base;
      min-height: 24px;
    }

    .stat-divider {
      @apply w-px h-8;
      background: var(--glass-border);
    }

    .stat-label-warning {
      color: #fbbf24;
    }
  `
})
export class HeaderStatsComponent {
  readonly store = inject(SimulatorStore);
  readonly Math = Math;
}
