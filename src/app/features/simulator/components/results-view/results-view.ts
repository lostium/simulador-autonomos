import { Component, inject } from '@angular/core';
import { PercentPipe } from '@angular/common';
import { AppCurrencyPipe } from '@app/shared/pipes/app-currency.pipe';
import { SimulatorStore } from '@app/core/store/simulator.store';
import { SaveScenarioComponent } from '@app/features/simulator/components/save-scenario/save-scenario';

@Component({
  selector: 'app-results-view',
  imports: [PercentPipe, AppCurrencyPipe, SaveScenarioComponent],
  template: `
    @if (store.results(); as res) {
      <div class="space-y-6 animate-fade-in">
        
        <!-- TOP: SUMMARY CARD -->
        <div class="summary-card" [class.summary-card-refund]="res.balance <= 0" [class.summary-card-pay]="res.balance > 0">
          <div class="summary-glow"></div>
          
          <div class="relative z-10">
            <div class="text-xs font-bold uppercase tracking-widest mb-3 opacity-60" i18n="@@results.finalResult">
              Resultado Final
            </div>
            
            <div class="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-6">
              <div>
                <div class="text-5xl md:text-6xl font-extrabold mb-2 tabular-nums">
                  {{ Math.abs(res.balance) | appCurrency }}
                </div>
                <div class="result-badge" [class.result-badge-refund]="res.balance <= 0" [class.result-badge-pay]="res.balance > 0">
                  @if (res.balance > 0) {
                    <span i18n="@@results.status.pay">A PAGAR</span>
                  } @else {
                    <span i18n="@@results.status.refund">A DEVOLVER</span>
                  }
                </div>
              </div>
              
              <div class="text-left md:text-right">
                <div class="text-xs uppercase tracking-wider opacity-60 mb-1" i18n="@@results.totalQuota">Cuota Total</div>
                <div class="text-2xl font-bold">{{ res.finalTax | appCurrency }}</div>
              </div>
            </div>
            
            <div class="summary-divider"></div>
            
            <div class="flex flex-wrap justify-between gap-4 text-sm opacity-80">
              <span>
                <span i18n="@@results.withholding.label">Retenciones</span> 
                (@if (store.params().customWithholdingAmount !== null) {
                  <span i18n="@@results.withholding.custom">Personalizada</span>
                } @else {
                  {{ store.params().withholdingRate | percent:'1.0-0' }}
                }): 
                <span class="font-semibold" style="color: #22d3ee">-{{ res.withholdings | appCurrency }}</span>
              </span>
              <span><span i18n="@@results.effectiveRate.label">Tipo Medio: </span><span class="font-semibold" style="color: #fbbf24">{{ res.effectiveRate | percent:'1.1-2' }}</span></span>
            </div>
            
            <!-- Detailed Reductions -->
            @if (res.deductibleHealth > 0 || res.totalPensionReduction > 0 || res.ngoDeduction > 0) {
              <div class="mt-6 space-y-2">
                @if (res.deductibleHealth > 0) {
                  <div class="reduction-row">
                    <span class="opacity-60" i18n="@@results.reduction.health">Reducción Seguro Médico</span>
                    <span class="font-mono text-emerald-400">-{{ res.deductibleHealth | appCurrency }}</span>
                  </div>
                }
                @if (res.totalPensionReduction > 0) {
                  <div class="reduction-row">
                    <span class="opacity-60" i18n="@@results.reduction.pension">Reducción Plan Pensiones</span>
                    <span class="font-mono text-emerald-400">-{{ res.totalPensionReduction | appCurrency }}</span>
                  </div>
                }
                @if (res.ngoDeduction > 0) {
                  <div class="reduction-row">
                    <span class="opacity-60" i18n="@@results.reduction.ngo">Deducción Donaciones</span>
                    <span class="font-mono text-emerald-400">-{{ res.ngoDeduction | appCurrency }}</span>
                  </div>
                }
              </div>
            }
          </div>
        </div>
        <!-- DESGLOSE BASE LIQUIDABLE -->
        <div class="breakdown-card">
          <div class="breakdown-header">
            <span class="material-symbols-outlined text-cyan-400">analytics</span>
            <h3 class="font-bold text-lg" i18n="@@results.breakdown.title">Desglose de Base Liquidable</h3>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full breakdown-table">
              <thead>
                <tr>
                  <th class="text-left" i18n="@@results.table.concept">Concepto</th>
                  <th class="text-right" i18n="@@results.table.amount">Importe</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td i18n="@@results.breakdown.grossRevenue">Facturación Bruta</td>
                  <td class="text-right font-mono text-emerald-400 font-semibold">
                    +{{ res.netRevenue | appCurrency }}
                  </td>
                </tr>
                @if (res.deductibleExpenses - res.autonomousQuota > 0) {
                  <tr>
                    <td i18n="@@results.breakdown.deductibleExpenses">Gastos Deducibles</td>
                    <td class="text-right font-mono text-rose-400 font-semibold">
                      -{{ res.deductibleExpenses - res.autonomousQuota | appCurrency }}
                    </td>
                  </tr>
                }
                @if (res.autonomousQuota > 0) {
                  <tr>
                    <td i18n="@@results.breakdown.autonomousQuota">Cuota de Autónomos</td>
                    <td class="text-right font-mono text-rose-400 font-semibold">
                      -{{ res.autonomousQuota | appCurrency }}
                    </td>
                  </tr>
                }
                @if (res.diffJustification > 0) {
                  <tr>
                    <td i18n="@@results.breakdown.diffJustification">Gastos de Difícil Justificación (5%)</td>
                    <td class="text-right font-mono text-rose-400 font-semibold">
                      -{{ res.diffJustification | appCurrency }}
                    </td>
                  </tr>
                }
                @if (res.lowIncomeReduction > 0) {
                  <tr>
                    <td i18n="@@results.breakdown.lowIncome">Reducción de Contribuyentes Bajos</td>
                    <td class="text-right font-mono text-rose-400 font-semibold">
                      -{{ res.lowIncomeReduction | appCurrency }}
                    </td>
                  </tr>
                }
              </tbody>
              <tfoot>
                <tr>
                  <td class="font-bold uppercase" i18n="@@results.breakdown.taxableBase">Base Liquidable</td>
                  <td class="text-right font-mono text-2xl font-extrabold text-indigo-400">
                    {{ res.taxableBase | appCurrency }}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <!-- TABS CONTROLS -->
        <div class="tabs-container">
          <button
            (click)="store.setTab('global')"
            class="tab-btn"
            [class.tab-btn-active]="store.activeTab() === 'global'"
            [class.tab-btn-inactive]="store.activeTab() !== 'global'"
            i18n="@@results.tab.global">
            Tabla Global Agregada
          </button>
          <button
            (click)="store.setTab('split')"
            class="tab-btn"
            [class.tab-btn-active]="store.activeTab() === 'split'"
            [class.tab-btn-inactive]="store.activeTab() !== 'split'"
            i18n="@@results.tab.split">
            Desglose Estatal/Autonómico
          </button>
        </div>

        @if (store.activeTab() === 'global') {
          <div class="space-y-6 animate-fade-in">
            <!-- TRAMOS IRPF CONSOLIDADOS -->
            <div class="breakdown-card">
              <div class="breakdown-header">
                <div>
                  <h3 class="font-bold text-lg" i18n="@@results.consolidated.title">Tramos IRPF Consolidados</h3>
                  <p class="text-xs card-muted mt-1" i18n="@@results.consolidated.subtitle">Suma de tipos Estatal + Autonómico para cada tramo.</p>
                </div>
              </div>

              <div class="overflow-x-auto">
                <table class="w-full bracket-table">
                  <thead>
                    <tr>
                      <th i18n="@@results.table.bracketRent">Tramo de Renta</th>
                      <th i18n="@@results.table.baseInBracket">Base en Tramo</th>
                      <th i18n="@@results.table.typeGlobal">Tipo Global</th>
                      <th i18n="@@results.table.quota">Cuota</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (row of res.globalBreakdown; track row.range) {
                      <tr [class.bracket-row-active]="row.base > 0">
                        <td>{{ row.range }}</td>
                        <td [class.cell-dimmed]="row.base <= 0" [class.font-semibold]="row.base > 0">
                          {{ row.base | appCurrency }}
                        </td>
                        <td class="font-semibold cell-rate">{{ row.rate | percent:'1.1-2' }}</td>
                        <td [class.cell-dimmed]="row.base <= 0" [class.text-indigo-400]="row.base > 0" [class.font-semibold]="row.base > 0">
                          {{ row.quota | appCurrency }}
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>

              <div class="marginal-rate-banner">
                <span class="material-symbols-outlined banner-icon">info</span>
                <span class="banner-text">
                  <ng-container i18n="@@results.marginal.text">El Tipo Marginal (máximo que pagas) es del</ng-container> <strong class="banner-value"> {{ res.marginalRate | percent:'1.1-2' }}</strong>
                </span>
              </div>
            </div>
          </div>
        } @else {
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
            <!-- SPLIT STATE TABLE -->
            <div class="breakdown-card">
              <div class="breakdown-header">
                <div>
                  <h3 class="font-bold" i18n="@@results.state.title">Tramo Estatal</h3>
                  <p class="text-xs card-muted mt-1" i18n="@@results.state.subtitle">Escala válida para todo el territorio.</p>
                </div>
              </div>
              <div class="overflow-x-auto">
                <table class="w-full bracket-table">
                  <thead>
                    <tr>
                      <th i18n="@@results.table.bracket">Tramo</th>
                      <th i18n="@@results.table.base">Base</th>
                      <th i18n="@@results.table.type">Tipo</th>
                      <th i18n="@@results.table.quota">Cuota</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (row of res.stateBreakdown; track row.range) {
                      <tr [class.bracket-row-active]="row.base > 0">
                        <td>{{ row.range }}</td>
                        <td [class.cell-dimmed]="row.base <= 0" [class.font-semibold]="row.base > 0">{{ row.base | appCurrency }}</td>
                        <td class="font-semibold cell-rate">{{ row.rate | percent:'1.1-2' }}</td>
                        <td [class.cell-dimmed]="row.base <= 0" [class.text-indigo-400]="row.base > 0" [class.font-semibold]="row.base > 0">{{ row.quota | appCurrency }}</td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            </div>

            <!-- SPLIT REGIONAL TABLE -->
            <div class="breakdown-card">
              <div class="breakdown-header">
                <div>
                  <h3 class="font-bold" i18n="@@results.regional.title">Tramo Autonómico</h3>
                  <p class="text-xs card-muted mt-1" i18n="@@results.regional.subtitle">Escala de la comunidad seleccionada.</p>
                </div>
              </div>
              <div class="overflow-x-auto">
                <table class="w-full bracket-table">
                  <thead>
                    <tr>
                      <th>Tramo</th>
                      <th>Base</th>
                      <th i18n="@@results.table.type">Tipo</th>
                      <th i18n="@@results.table.quota">Cuota</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (row of res.peopleBreakdown; track row.range) {
                      <tr [class.bracket-row-active]="row.base > 0">
                        <td>{{ row.range }}</td>
                        <td [class.cell-dimmed]="row.base <= 0" [class.font-semibold]="row.base > 0">{{ row.base | appCurrency }}</td>
                        <td class="font-semibold cell-rate">{{ row.rate | percent:'1.1-2' }}</td>
                        <td [class.cell-dimmed]="row.base <= 0" [class.text-indigo-400]="row.base > 0" [class.font-semibold]="row.base > 0">{{ row.quota | appCurrency }}</td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        }

        <!-- SOCIAL SECURITY SUMMARY CARD -->
        <div class="ss-summary-card" 
          [class.ss-card-correct]="Math.abs(res.autonomousQuotaDiff) < 1"
          [class.ss-card-warning]="res.autonomousQuotaDiff < -1"
          [class.ss-card-info]="res.autonomousQuotaDiff > 1">
          <div class="ss-glow"></div>
          
          <div class="relative z-10">
            <div class="text-xs font-bold uppercase tracking-widest mb-3 opacity-60" i18n="@@results.ss.title">
              Cuota Seguridad Social
            </div>
            
            <div class="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-6">
              <div>
                <div class="text-5xl md:text-6xl font-extrabold mb-2 tabular-nums">
                  @if (Math.abs(res.autonomousQuotaDiff) < 1) {
                    {{ res.autonomousQuota | appCurrency }}
                  } @else {
                    {{ Math.abs(res.autonomousQuotaDiff) | appCurrency }}
                  }
                </div>
                <div class="ss-badge"
                  [class.ss-badge-correct]="Math.abs(res.autonomousQuotaDiff) < 1"
                  [class.ss-badge-warning]="res.autonomousQuotaDiff < -1"
                  [class.ss-badge-info]="res.autonomousQuotaDiff > 1">
                  @if (Math.abs(res.autonomousQuotaDiff) < 1) {
                    <span i18n="@@results.ss.status.correct">CUOTA CORRECTA</span>
                  } @else if (res.autonomousQuotaDiff < -1) {
                    <span i18n="@@results.ss.status.underpaying">REGULARIZACIÓN PENDIENTE</span>
                  } @else {
                    <span i18n="@@results.ss.status.overpaying">APORTACIÓN EXTRA</span>
                  }
                </div>
              </div>
              
              <div class="text-left md:text-right">
                <div class="text-xs uppercase tracking-wider opacity-60 mb-1" i18n="@@results.ss.annualQuota">Cuota Anual</div>
                <div class="text-2xl font-bold">{{ res.autonomousQuota | appCurrency }}</div>
              </div>
            </div>
            
            <div class="ss-divider"></div>
            
            <div class="flex flex-wrap justify-between gap-4 text-sm opacity-80">
              <span>
                <span i18n="@@results.ss.theoreticalQuota">Cuota Teórica</span>: 
                <span class="font-semibold" style="color: #22d3ee">{{ res.theoreticalAutonomousQuota | appCurrency }}</span>
              </span>
              <span>
                <span i18n="@@results.ss.retaRate">Tipo Cotización</span>: 
                <span class="font-semibold" style="color: #fbbf24">{{ res.retaRate | percent:'1.1-2' }}</span>
              </span>
            </div>
            
            @if (Math.abs(res.autonomousQuotaDiff) >= 1) {
              <div class="mt-4 text-sm opacity-90">
                @if (res.autonomousQuotaDiff < -1) {
                  <span i18n="@@results.ss.underpaying.detail">
                    Estás cotizando por debajo de tus ingresos reales. Esto podría generar una regularización posterior de {{ Math.abs(res.autonomousQuotaDiff) | appCurrency }} anuales.
                  </span>
                } @else {
                  <span i18n="@@results.ss.overpaying.detail">
                    Estás cotizando por encima del mínimo obligatorio. Esto es voluntario y mejora tus prestaciones futuras.
                  </span>
                }
              </div>
            }
          </div>
        </div>

        <!-- RETA Brackets Table -->
        <div class="breakdown-card">
          <div class="breakdown-header">
            <span class="material-symbols-outlined text-emerald-400">table_chart</span>
            <div>
              <h3 class="font-bold text-lg" i18n="@@results.ss.brackets.title">Tramos de Cotización RETA 2025</h3>
              <p class="text-xs card-muted mt-1" i18n="@@results.ss.brackets.subtitle">Cuotas según rendimientos netos mensuales.</p>
            </div>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full bracket-table">
              <thead>
                <tr>
                  <th class="text-left" i18n="@@results.ss.table.bracket">Tramo Rendimientos</th>
                  <th i18n="@@results.ss.table.contributionBase">Base Cotización</th>
                  <th i18n="@@results.ss.table.monthlyQuota">Cuota Mensual</th>
                </tr>
              </thead>
              <tbody>
                @for (row of res.retaBreakdown; track row.range) {
                  <tr [class.bracket-row-active]="row.isActive">
                    <td [class.font-semibold]="row.isActive">
                      @if (row.isActive) {
                        <span class="inline-flex items-center gap-2">
                          <span class="material-symbols-outlined text-emerald-400 text-base">arrow_right</span>
                          {{ row.range }}
                        </span>
                      } @else {
                        {{ row.range }}
                      }
                    </td>
                    <td [class.cell-dimmed]="!row.isActive" [class.font-semibold]="row.isActive">
                      {{ row.contributionBase | appCurrency }}
                    </td>
                    <td [class.cell-dimmed]="!row.isActive" [class.text-emerald-400]="row.isActive" [class.font-semibold]="row.isActive">
                      {{ row.monthlyQuota | appCurrency }}
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>

        <!-- Save Scenario -->
        <app-save-scenario class="mt-6 block" />

      </div>
    }
  `,
  styles: `
    @reference "tailwindcss";

    .summary-card {
      @apply p-6 md:p-8 rounded-3xl text-white relative overflow-hidden;
    }
    .summary-card-refund {
      background: linear-gradient(135deg, #064e3b 0%, #0f766e 50%, #155e75 100%);
    }
    .summary-card-pay {
      background: linear-gradient(135deg, #7f1d1d 0%, #991b1b 50%, #9a3412 100%);
    }

    .summary-glow {
      @apply absolute -right-20 -top-20 w-64 h-64 rounded-full opacity-30 blur-3xl;
      background: radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%);
    }

    .result-badge {
      @apply text-sm font-bold uppercase px-4 py-1.5 rounded-full inline-block;
    }
    .result-badge-refund {
      background: rgba(16, 185, 129, 0.2);
      color: #6ee7b7;
    }
    .result-badge-pay {
      background: rgba(244, 63, 94, 0.2);
      color: #fda4af;
    }

    .summary-divider {
      @apply w-full h-px my-4;
      background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%);
    }

    .reduction-row {
      @apply flex justify-between text-xs;
    }

    .breakdown-card {
      @apply rounded-2xl overflow-hidden;
      background: var(--glass-bg);
      border: 1px solid var(--glass-border);
      box-shadow: var(--glass-shadow);
    }

    .breakdown-header {
      @apply p-5 flex items-center gap-3;
      border-bottom: 1px solid var(--glass-border);
    }

    .card-muted {
      color: var(--color-text-muted);
    }

    .breakdown-table {
      @apply text-sm;
    }
    .breakdown-table thead th {
      @apply py-3 px-5 text-xs font-bold uppercase tracking-wider;
      color: var(--color-text-muted);
      background: var(--table-row-alt);
    }
    .breakdown-table tbody td {
      @apply py-4 px-5;
      color: var(--color-text-secondary);
      border-bottom: 1px solid var(--glass-border);
    }
    .breakdown-table tbody tr:hover {
      background: var(--table-row-hover);
    }
    .breakdown-table tfoot td {
      @apply py-5 px-5;
      background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(6, 182, 212, 0.1) 100%);
    }

    .tabs-container {
      @apply flex gap-2 p-1.5 rounded-xl;
      background: var(--glass-bg);
      border: 1px solid var(--glass-border);
      box-shadow: var(--glass-shadow);
    }

    .tab-btn {
      @apply flex-1 px-4 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 cursor-pointer;
    }
    .tab-btn-active {
      background: linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(6, 182, 212, 0.2) 100%);
      color: var(--color-text-primary);
      box-shadow: 0 4px 15px rgba(99, 102, 241, 0.2);
    }
    .tab-btn-inactive {
      color: var(--color-text-muted);
    }
    .tab-btn-inactive:hover {
      color: var(--color-text-secondary);
      background: var(--table-row-alt);
    }

    .bracket-table th {
      @apply py-3 px-4 text-xs font-bold uppercase tracking-wider text-right;
      color: var(--color-text-muted);
      background: var(--table-row-alt);
      border-bottom: 1px solid var(--glass-border);
    }
    .bracket-table th:first-child {
      @apply text-left;
    }
    .bracket-table td {
      @apply py-3 px-4 text-sm text-right tabular-nums whitespace-nowrap;
      color: var(--color-text-secondary);
      border-bottom: 1px solid var(--glass-border);
    }
    .bracket-table td:first-child {
      @apply text-left font-medium whitespace-normal min-w-[100px];
    }
    .bracket-table tbody tr:nth-child(even) {
      background: var(--table-row-alt);
    }
    .bracket-table tbody tr:hover {
      background: var(--table-row-hover);
    }
    .bracket-row-active {
      background: rgba(99, 102, 241, 0.08) !important;
    }

    .cell-dimmed {
      color: var(--color-text-muted);
    }
    .cell-rate {
      color: var(--color-text-primary);
    }

    .marginal-rate-banner {
      @apply p-4 flex items-center gap-3 text-sm;
      background: var(--banner-bg, rgba(245, 158, 11, 0.15));
      border-top: 1px solid var(--banner-border, rgba(245, 158, 11, 0.3));
    }
    .banner-icon {
      color: var(--color-warning, #f59e0b);
    }
    .banner-text {
      color: var(--color-text-primary);
    }
    .banner-value {
      color: var(--color-warning, #f59e0b);
      color: var(--color-warning, #f59e0b);
      font-weight: 700;
    }

    .analysis-card {
      @apply p-5 rounded-2xl relative overflow-hidden transition-all duration-300;
      border: 1px solid transparent;
    }
    .analysis-correct {
      background: rgba(16, 185, 129, 0.1);
      border-color: rgba(16, 185, 129, 0.2);
      color: #34d399;
    }
    .analysis-warning {
      background: rgba(244, 63, 94, 0.1);
      border-color: rgba(244, 63, 94, 0.2);
      color: #fb7185;
    }
    .analysis-info {
      background: rgba(59, 130, 246, 0.1);
      border-color: rgba(59, 130, 246, 0.2);
      color: #60a5fa;
    }

    .analysis-icon {
      @apply p-2 rounded-lg bg-white/5;
    }

    .analysis-details {
      @apply mt-3 p-3 rounded-xl space-y-1;
      background: rgba(0,0,0,0.1);
    }

    /* Social Security Summary Card */
    .ss-summary-card {
      @apply p-6 md:p-8 rounded-3xl text-white relative overflow-hidden;
    }
    .ss-card-correct {
      background: linear-gradient(135deg, #064e3b 0%, #0f766e 50%, #155e75 100%);
    }
    .ss-card-warning {
      background: linear-gradient(135deg, #7f1d1d 0%, #991b1b 50%, #9a3412 100%);
    }
    .ss-card-info {
      background: linear-gradient(135deg, #1e3a5f 0%, #1e40af 50%, #312e81 100%);
    }

    .ss-glow {
      @apply absolute -right-20 -top-20 w-64 h-64 rounded-full opacity-30 blur-3xl;
      background: radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%);
    }

    .ss-badge {
      @apply text-sm font-bold uppercase px-4 py-1.5 rounded-full inline-block;
    }
    .ss-badge-correct {
      background: rgba(16, 185, 129, 0.2);
      color: #6ee7b7;
    }
    .ss-badge-warning {
      background: rgba(244, 63, 94, 0.2);
      color: #fda4af;
    }
    .ss-badge-info {
      background: rgba(59, 130, 246, 0.2);
      color: #93c5fd;
    }

    .ss-divider {
      @apply w-full h-px my-4;
      background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%);
    }

    .ss-bracket-banner {
      @apply p-4 rounded-2xl flex items-start gap-4;
      background: var(--glass-bg);
      border: 1px solid var(--glass-border);
      box-shadow: var(--glass-shadow);
    }
  `
})
export class ResultsViewComponent {
  store = inject(SimulatorStore);
  Math = Math;
}
