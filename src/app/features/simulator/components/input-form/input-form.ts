import { Component, effect, inject, output } from '@angular/core';
import { AppCurrencyPipe } from '@app/shared/pipes/app-currency.pipe';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule, Validators } from '@angular/forms';
import { SimulatorStore } from '@app/core/store/simulator.store';
import { ScenarioHistoryComponent } from '@app/features/simulator/components/scenario-history/scenario-history';
import { SaveScenarioComponent } from '@app/features/simulator/components/save-scenario/save-scenario';
import { TaxConfigService } from '@app/core/services/tax-config.service';

@Component({
  selector: 'app-input-form',
  imports: [ReactiveFormsModule, ScenarioHistoryComponent, SaveScenarioComponent, AppCurrencyPipe, FormsModule],
  template: `
    <div class="space-y-6">
      <!-- Scenario History (Collapsible) -->
      <app-scenario-history />
    
      <form [formGroup]="form" class="space-y-6">
        
        <!-- 1. ECONOMICS (Full Width - Indigo/Cyan) -->
        <div class="form-card form-card-primary">
          <div class="form-card-header">
            <div class="form-icon form-icon-primary">
              <span class="material-symbols-outlined">euro</span>
            </div>
            <h2 class="text-lg font-bold" i18n="@@input.section.economic">Datos Económicos</h2>
          </div>
          
          <div class="space-y-5">
            <div>
              <label class="input-label" i18n="@@input.label.grossIncome">Total Facturado (Base)</label>
              <div class="relative flex items-center">
                <input type="number" formControlName="grossIncome" class="input-field pl-10 pr-10 font-bold text-lg" placeholder="Ej. 45.000" i18n-placeholder="@@input.placeholder.grossIncome" />
                <span class="absolute left-3 input-icon material-symbols-outlined text-lg">payments</span>
                <span class="absolute right-3 input-icon text-sm font-bold">€</span>
              </div>
            </div>

            <!-- Withholdings Section -->
            <div>
              <label class="input-label" i18n="@@input.label.withholding">Retenciones</label>
              <div class="flex gap-2 mb-2">
                <button type="button" 
                  (click)="setWithholding(0.15)"
                  class="btn-toggle"
                  [class.active]="form.get('withholdingRate')?.value === 0.15 && form.get('customWithholdingAmount')?.value === null">
                  15%
                </button>
                <button type="button" 
                  (click)="setWithholding(0.07)"
                  class="btn-toggle"
                  [class.active]="form.get('withholdingRate')?.value === 0.07 && form.get('customWithholdingAmount')?.value === null">
                  7%
                </button>
                <button type="button" 
                  (click)="setCustomWithholding()"
                  class="btn-toggle"
                  [class.active]="form.get('customWithholdingAmount')?.value !== null">
                  <span i18n="@@input.btn.custom">Personalizado</span>
                </button>
              </div>

              @if (form.get('customWithholdingAmount')?.value !== null) {
                <div class="animate-in fade-in duration-300">
                  <div class="relative flex items-center">
                    <input type="number" formControlName="customWithholdingAmount" class="input-field pr-10" placeholder="Ej. 2000" i18n-placeholder="@@input.placeholder.customWithholding" />
                    <span class="absolute right-3 text-slate-500 text-sm font-bold">€</span>
                  </div>
                  <p class="text-xs help-text leading-relaxed mt-1.5">
                    @if (customWithholdingPercentage !== null) {
                      <span i18n="@@input.withholding.equivalent">Equivale al </span><span class="font-bold text-indigo-400">{{ customWithholdingPercentage }}%</span><span i18n="@@input.withholding.ofBase"> del total facturado.</span>
                    } @else {
                      <ng-container i18n="@@input.withholding.help.custom">Introduce el total anual retenido en tus facturas.</ng-container>
                    }
                  </p>
                </div>
              } @else {
                <p class="text-xs help-text leading-relaxed">
                  <span i18n="@@input.withholding.applied">Retención aplicada: </span><span class="font-bold text-indigo-400">{{ roundedWithholdingRate }}%</span><span i18n="@@input.withholding.ofBase"> del total facturado.</span>
                </p>
              }
            </div>
            
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="input-label" i18n="@@input.label.expenses">Gastos Anuales</label>
                <div class="relative flex items-center">
                  <input type="number" formControlName="expenses" class="input-field pr-10" placeholder="Ej. 2.000" i18n-placeholder="@@input.placeholder.expenses" />
                  <span class="absolute right-3 input-icon text-sm font-bold">€</span>
                </div>
              </div>
              <div>
                <label class="input-label" i18n="@@input.label.quota">Cuota Autónomos</label>
                <div class="relative flex items-center">
                  <input type="number" formControlName="autonomousQuota" class="input-field pr-10" placeholder="Auto" i18n-placeholder="@@input.placeholder.auto" />
                  <span class="absolute right-3 input-icon text-sm font-bold">€</span>
                </div>
                <div class="text-[10px] input-icon mt-1.5 text-right" i18n="@@input.help.quota">Dejar vacío para auto-cálculo</div>
              </div>
            </div>
            
            <!-- Detailed Expenses Section -->
            <div class="pt-4 border-t border-white/5">
              <label class="input-label text-cyan-400 mb-3" i18n="@@input.details.title">Desglose de Gastos (Opcional)</label>
              <div class="grid grid-cols-12 gap-2 mb-3">
                <div class="col-span-12 md:col-span-5">
                  <input 
                    type="text" 
                    [(ngModel)]="newExpConcept" 
                    [ngModelOptions]="{standalone: true}"
                    placeholder="Concepto" 
                    i18n-placeholder="@@input.details.concept"
                    class="input-field text-sm" />
                </div>
                <div class="col-span-6 md:col-span-3">
                  <div class="relative flex items-center">
                    <input 
                      type="number" 
                      [(ngModel)]="newExpAmount" 
                      [ngModelOptions]="{standalone: true}"
                      placeholder="0" 
                      class="input-field text-sm pr-8" />
                    <span class="absolute right-3 input-icon text-xs font-bold">€</span>
                  </div>
                </div>
                <div class="col-span-6 md:col-span-4 flex gap-2">
                  <select [(ngModel)]="newExpFreq" [ngModelOptions]="{standalone: true}" class="input-field text-sm px-2 flex-1">
                    <option [ngValue]="1" i18n="@@input.details.freq.annual">Anual</option>
                    <option [ngValue]="12" i18n="@@input.details.freq.monthly">Mensual</option>
                  </select>
                  <button 
                    type="button"
                    (click)="addExpense()" 
                    class="add-expense-btn">
                    <span class="material-symbols-outlined text-lg">add</span>
                  </button>
                </div>
              </div>
              
              @if (store.params().detailedExpenses.length > 0) {
                <div class="expense-list">
                  <table class="w-full text-sm">
                    <tbody>
                      @for (exp of store.params().detailedExpenses; track exp.id) {
                        <tr class="expense-row">
                          <td class="px-3 py-2.5 expense-cell">{{ exp.concept }}</td>
                          <td class="px-3 py-2.5 text-right expense-cell-secondary tabular-nums">{{ exp.amount | appCurrency:undefined:'symbol':'1.0-0' }}</td>
            <td class="px-3 py-2.5 text-right expense-cell-muted text-xs">
                            @if (exp.frequency === 12) {
                              x12
                            } @else {
                              <ng-container i18n="@@input.details.yearly">anual</ng-container>
                            }
                          </td>
                          <td class="px-3 py-2.5 text-right font-semibold expense-cell tabular-nums">
                            {{ exp.annualAmount | appCurrency:undefined:'symbol':'1.0-0' }}
                          </td>
                          <td class="px-2 py-2.5 w-8">
                            <button 
                              type="button"
                              (click)="removeExpense(exp.id)" 
                              class="text-slate-500 hover:text-rose-400 transition-colors">
                              <span class="material-symbols-outlined text-base">close</span>
                            </button>
                          </td>
                        </tr>
                      }
                    </tbody>
                  </table>
                   <div class="flex justify-between items-center text-sm px-3 py-2 border-t expense-border">
                    <span class="expense-cell-muted" i18n="@@input.details.total">Total Detallado:</span>
                    <span class="font-bold text-cyan-400">{{ totalDetailedExpenses | appCurrency:undefined:'symbol':'1.0-0' }}</span>
                  </div>
                </div>
              }
            </div>
            
            <div class="pt-4 border-t border-white/5">
              <label class="toggle-container">
                <div class="toggle-wrapper">
                  <input type="checkbox" formControlName="isDiffJustification" class="sr-only peer" />
                  <div class="toggle-track peer-checked:bg-indigo-500"></div>
                  <div class="toggle-thumb peer-checked:translate-x-full"></div>
                </div>
                <span class="text-sm font-medium toggle-label" i18n="@@input.check.expensesDiff">Aplicar 5% Gastos Difícil Justif.</span>
              </label>
            </div>
          </div>
        </div>

        <!-- Grid 2x2 for secondary cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <!-- 2. PROFILE (Emerald) -->
          <div class="form-card form-card-emerald">
            <div class="form-card-header">
              <div class="form-icon form-icon-emerald">
                <span class="material-symbols-outlined">person_pin</span>
              </div>
              <h2 class="text-lg font-bold" i18n="@@input.section.profile">Perfil Fiscal</h2>
            </div>
            
            <div class="space-y-4">
              <div>
                <label class="input-label" i18n="@@input.profile.region">Comunidad Autónoma</label>
                <select formControlName="region" class="input-field">
                  @for (region of regions; track region.key) {
                    <option [value]="region.key">{{ region.label }}</option>
                  }
                </select>
              </div>
              
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="input-label" i18n="@@input.profile.age">Edad</label>
                  <select formControlName="age" class="input-field">
                    <option value="under65" i18n="@@input.age.under65">Menor 65</option>
                    <option value="over65" i18n="@@input.age.over65">Mayor 65</option>
                    <option value="over75" i18n="@@input.age.over75">Mayor 75</option>
                  </select>
                </div>
                <div>
                  <label class="input-label" i18n="@@input.profile.children">Hijos (< 25)</label>
                  <input type="number" formControlName="children" class="input-field" min="0" />
                </div>
              </div>
            </div>
            
            <div class="mt-4 pt-4 border-t border-white/5">
              <label class="toggle-container">
                <div class="toggle-wrapper">
                  <input type="checkbox" formControlName="isSocietario" class="sr-only peer" />
                  <div class="toggle-track peer-checked:bg-emerald-500"></div>
                  <div class="toggle-thumb peer-checked:translate-x-full"></div>
                </div>
                <div class="flex flex-col">
                  <span class="text-sm font-medium toggle-label" i18n="@@input.check.societario">Autónomo Societario</span>
                </div>
              </label>
            </div>
          </div>

          <!-- 3. HEALTH (Cyan) -->
          <div class="form-card form-card-cyan">
            <div class="form-card-header">
              <div class="form-icon form-icon-cyan">
                <span class="material-symbols-outlined">medical_services</span>
              </div>
              <h2 class="text-lg font-bold" i18n="@@input.section.health">Seguro Médico</h2>
            </div>
            
            <div class="space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="input-label" i18n="@@input.health.annualCost">Gastos Anuales</label>
                  <div class="relative flex items-center">
                    <input type="number" formControlName="healthInsurance" class="input-field pr-10" placeholder="Ej. 600" i18n-placeholder="@@input.placeholder.healthInsurance" />
                    <span class="absolute right-3 text-slate-500 text-sm font-bold">€</span>
                  </div>
                </div>
                <div>
                  <label class="input-label" i18n="@@input.health.insuredCount">Nº Asegurados</label>
                  <input type="number" formControlName="healthPeople" class="input-field" min="1" />
                </div>
              </div>
              <p class="text-xs help-text leading-relaxed" i18n="@@input.help.health">Deducible hasta 500€ por persona (titular, cónyuge e hijos < 25 años).</p>
            </div>
          </div>

          <!-- 4. PENSIONS (Orange) -->
          <div class="form-card form-card-orange">
            <div class="form-card-header">
              <div class="form-icon form-icon-orange">
                <span class="material-symbols-outlined">savings</span>
              </div>
              <h2 class="text-lg font-bold" i18n="@@input.section.pension">Planes de Pensiones</h2>
            </div>
            
            <div class="space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="input-label" i18n="@@input.pension.individual">P. Individual</label>
                  <div class="relative flex items-center">
                    <input type="number" formControlName="personalPension" class="input-field pr-10" placeholder="Máx 1.500" i18n-placeholder="@@input.placeholder.max1500" />
                    <span class="absolute right-3 text-slate-500 text-sm font-bold">€</span>
                  </div>
                </div>
                <div>
                  <label class="input-label" i18n="@@input.pension.autonomous">P. Autónomo</label>
                  <div class="relative flex items-center">
                    <input type="number" formControlName="autonomousPension" class="input-field pr-10" placeholder="Máx 4.250" i18n-placeholder="@@input.placeholder.max4250" />
                    <span class="absolute right-3 text-slate-500 text-sm font-bold">€</span>
                  </div>
                </div>
              </div>
              <p class="text-xs help-text leading-relaxed" i18n="@@input.help.pension">Límites: 1.500€ (indiv.) + 4.250€ (empleo). Máx 30% Rend. Neto.</p>
            </div>
          </div>

          <!-- 5. DONATIONS (Rose) -->
          <div class="form-card form-card-rose">
            <div class="form-card-header">
              <div class="form-icon form-icon-rose">
                <span class="material-symbols-outlined">volunteer_activism</span>
              </div>
              <h2 class="text-lg font-bold" i18n="@@input.section.charity">Donaciones ONG</h2>
            </div>
            
            <div class="space-y-4">
              <div>
                <label class="input-label" i18n="@@input.charity.amount">Importe Anual</label>
                <div class="relative flex items-center">
                  <input type="number" formControlName="ngoDonations" class="input-field pr-10" placeholder="Ej. 300" i18n-placeholder="@@input.placeholder.ngoDonations" />
                  <span class="absolute right-3 text-slate-500 text-sm font-bold">€</span>
                </div>
              </div>
              <p class="text-xs help-text leading-relaxed" i18n="@@input.help.charity">Deducción: 80% de los primeros 250€ y 40% del resto.</p>
            </div>
          </div>
        </div>

      </form>
      
      <!-- Save Scenario -->
      <app-save-scenario class="mb-6 block" />

        <!-- Ver Resultados Button -->
        <button 
          type="button"
          (click)="goToResults.emit()" 
          [disabled]="!store.hasValidData()"
          class="cta-button group"
          [class.cta-button-disabled]="!store.hasValidData()">
          <span class="text-lg" i18n="@@input.button.viewResults">Ver Resultados</span>
          <span class="material-symbols-outlined transition-transform duration-300 group-hover:translate-x-1">arrow_forward</span>
        </button>
    </div>
  `,
  styles: `
    @reference "tailwindcss";

    .form-card {
      @apply p-6 rounded-2xl;
      background: var(--glass-bg);
      border: 1px solid var(--glass-border);
      box-shadow: var(--glass-shadow);
    }

    .form-card-primary { border-top: 3px solid #6366f1; }
    .form-card-emerald { border-top: 3px solid #10b981; }
    .form-card-cyan { border-top: 3px solid #06b6d4; }
    .form-card-orange { border-top: 3px solid #f97316; }
    .form-card-rose { border-top: 3px solid #f43f5e; }

    .form-card-header {
      @apply flex items-center gap-3 mb-5;
    }

    .form-icon {
      @apply w-10 h-10 rounded-xl flex items-center justify-center text-white;
    }
    .form-icon-primary { background: linear-gradient(135deg, #6366f1 0%, #06b6d4 100%); }
    .form-icon-emerald { background: linear-gradient(135deg, #10b981 0%, #06b6d4 100%); }
    .form-icon-cyan { background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%); }
    .form-icon-orange { background: linear-gradient(135deg, #f97316 0%, #eab308 100%); }
    .form-icon-rose { background: linear-gradient(135deg, #f43f5e 0%, #ec4899 100%); }

    .btn-toggle {
      @apply flex-1 py-2 px-3 rounded-xl transition-all text-sm font-bold;
      border: 1px solid var(--input-border);
      color: var(--color-text-muted);
    }
    .btn-toggle:hover:not(.active) {
      border-color: var(--color-text-muted);
    }
    .btn-toggle.active {
      @apply bg-indigo-500 border-indigo-500 text-white;
    }

    .input-icon {
      color: var(--color-text-muted);
    }

    .help-text {
      color: var(--color-text-muted);
    }

    .toggle-container {
      @apply flex items-center cursor-pointer select-none gap-3;
    }

    .toggle-wrapper {
      @apply relative;
    }

    .toggle-track {
      @apply w-11 h-6 rounded-full shadow-inner transition-colors duration-200;
      background: var(--input-border);
    }

    .peer:checked ~ .toggle-track {
      @apply bg-indigo-500;
    }

    .toggle-thumb {
      @apply absolute w-5 h-5 bg-white rounded-full shadow top-0.5 left-0.5 transition-all duration-200;
    }

    .toggle-label {
      color: var(--color-text-secondary);
    }

    .add-expense-btn {
      @apply w-11 h-11 rounded-xl flex items-center justify-center text-white transition-all duration-200 cursor-pointer;
      background: linear-gradient(135deg, #6366f1 0%, #06b6d4 100%);
    }
    .add-expense-btn:hover {
      transform: scale(1.05);
      box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);
    }

    .expense-list {
      @apply rounded-xl overflow-hidden;
      background: var(--table-row-alt);
      border: 1px solid var(--glass-border);
    }

    .expense-row {
      @apply transition-colors duration-200;
      border-bottom: 1px solid var(--glass-border);
    }
    .expense-row:last-child {
      border-bottom: none;
    }
    .expense-row:hover {
      background: var(--table-row-hover);
    }

    .expense-cell {
      color: var(--color-text-primary);
    }
    .expense-cell-secondary {
      color: var(--color-text-secondary);
    }
    .expense-cell-muted {
      color: var(--color-text-muted);
    }
    .expense-border {
      border-color: var(--glass-border);
    }

    .cta-button {
      @apply w-full py-5 rounded-2xl font-bold text-white flex items-center justify-center gap-3 transition-all duration-300 cursor-pointer;
      background: linear-gradient(135deg, #6366f1 0%, #06b6d4 100%);
      box-shadow: 0 8px 30px rgba(99, 102, 241, 0.3);
    }
    .cta-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 12px 40px rgba(99, 102, 241, 0.4);
    }
    .cta-button:active {
      transform: translateY(0);
    }
    .cta-button-disabled {
      background: var(--input-border);
      box-shadow: none;
      cursor: not-allowed;
      opacity: 0.6;
    }
    .cta-button-disabled:hover {
      transform: none;
      box-shadow: none;
    }
  `
})
export class InputFormComponent {
  private fb = inject(FormBuilder);
  store = inject(SimulatorStore);
  private configService = inject(TaxConfigService);

  goToResults = output<void>();

  get regions() {
    const data = this.configService.config();
    if (!data) return [];

    const labels: Record<string, string> = {
      common: $localize`:@@region.common:Estatal / Otras Comunidades`,
      madrid: $localize`:@@region.madrid:Comunidad de Madrid`,
      andalucia: $localize`:@@region.andalucia:Andalucía`,
      cataluna: $localize`:@@region.cataluna:Cataluña`,
      valencia: $localize`:@@region.valencia:Comunidad Valenciana`,
      galicia: $localize`:@@region.galicia:Galicia`,
      murcia: $localize`:@@region.murcia:Región de Murcia`,
      canarias: $localize`:@@region.canarias:Canarias`
    };

    return Object.keys(data.irpf.regionalScales).map(k => ({
      key: k,
      label: labels[k] || k.charAt(0).toUpperCase() + k.slice(1)
    }));
  }

  // Detailed Expenses Local State
  newExpConcept = '';
  newExpAmount: number | null = null;
  newExpFreq: 1 | 12 = 12;

  get totalDetailedExpenses() {
    return this.store.params().detailedExpenses.reduce((acc, curr) => acc + curr.annualAmount, 0);
  }

  get roundedWithholdingRate() {
    return Math.round((this.form.get('withholdingRate')?.value || 0) * 100).toFixed(0);
  }

  get customWithholdingPercentage(): string | null {
    const grossIncome = this.form.get('grossIncome')?.value;
    const customAmount = this.form.get('customWithholdingAmount')?.value;

    if (grossIncome && grossIncome > 0 && customAmount && customAmount > 0) {
      const percentage = (customAmount / grossIncome) * 100;
      return percentage.toFixed(0);
    }
    return null;
  }

  addExpense() {
    if (this.newExpConcept && this.newExpAmount) {
      const newExp = {
        id: crypto.randomUUID(),
        concept: this.newExpConcept,
        amount: this.newExpAmount,
        frequency: this.newExpFreq,
        annualAmount: this.newExpAmount * this.newExpFreq
      };

      const current = this.store.params().detailedExpenses;
      this.store.updateDetailedExpenses([...current, newExp]);

      this.newExpConcept = '';
      this.newExpAmount = null;
      this.newExpFreq = 12;
    }
  }

  removeExpense(id: string) {
    const current = this.store.params().detailedExpenses;
    this.store.updateDetailedExpenses(current.filter(e => e.id !== id));
  }

  form: FormGroup = this.fb.group({
    grossIncome: [0, Validators.required],
    expenses: [0],
    autonomousQuota: [null],
    region: ['common'],
    age: ['under65'],
    children: [0],
    isDiffJustification: [true],
    isSocietario: [false],
    personalPension: [0],
    autonomousPension: [0],
    healthInsurance: [0],
    healthPeople: [1],
    ngoDonations: [0],
    withholdingRate: [0.15],
    customWithholdingAmount: [null]
  });

  setWithholding(rate: number) {
    this.form.patchValue({
      withholdingRate: rate,
      customWithholdingAmount: null
    });
  }

  setCustomWithholding() {
    if (this.form.get('customWithholdingAmount')?.value === null) {
      this.form.patchValue({
        customWithholdingAmount: 0
      });
    }
  }

  constructor() {
    // Sync store -> form (When loading a saved sim)
    effect(() => {
      const p = this.store.params();
      this.form.patchValue({
        grossIncome: p.grossIncome,
        expenses: p.expenses,
        autonomousQuota: p.autonomousQuota,
        region: p.region,
        age: p.age,
        children: p.children,
        isDiffJustification: p.isDiffJustification,
        isSocietario: p.isSocietario,
        personalPension: p.personalPension,
        autonomousPension: p.autonomousPension,
        healthInsurance: p.healthInsurance,
        healthPeople: p.healthPeople,
        ngoDonations: p.ngoDonations,
        withholdingRate: p.withholdingRate,
        customWithholdingAmount: p.customWithholdingAmount
      }, { emitEvent: false });
    });

    // Sync form -> store
    this.form.valueChanges.subscribe(val => {
      const num = (v: any) => v === null || v === '' ? 0 : Number(v);

      this.store.updateGrossIncome(num(val.grossIncome));
      this.store.updateExpenses(num(val.expenses));
      this.store.updateQuota(val.autonomousQuota === null || val.autonomousQuota === '' ? null : Number(val.autonomousQuota));

      this.store.updateProfile({
        region: val.region,
        age: val.age,
        children: num(val.children),
        isDiffJustification: val.isDiffJustification,
        isSocietario: val.isSocietario
      });

      this.store.updateDeductions({
        personalPension: num(val.personalPension),
        autonomousPension: num(val.autonomousPension),
        healthInsurance: num(val.healthInsurance),
        healthPeople: num(val.healthPeople),
        ngoDonations: num(val.ngoDonations)
      });

      this.store.updateWithholdings({
        withholdingRate: num(val.withholdingRate),
        customWithholdingAmount: val.customWithholdingAmount === null || val.customWithholdingAmount === ''
          ? null
          : Number(val.customWithholdingAmount)
      });
    });
  }
}
