import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SimulatorStore } from '@app/core/store/simulator.store';
import { ToastService } from '@app/shared/components/toast/toast.service';

@Component({
  selector: 'app-save-scenario',
  imports: [FormsModule],
  template: `
    <div class="save-card">
      <div class="flex items-center gap-2 mb-3">
        <div class="save-icon">
          <span class="material-symbols-outlined text-sm">save</span>
        </div>
        <h4 class="text-sm font-bold card-title" i18n="@@save.title">Guardar Escenario</h4>
      </div>
      <div class="flex gap-2">
        <input
          type="text"
          [(ngModel)]="simName"
          [disabled]="!store.hasValidData()"
          placeholder="Nombre del escenario..."
          i18n-placeholder="@@save.placeholder.name"
          class="input-field flex-1 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <button
          (click)="save()"
          [disabled]="!simName().trim() || !store.hasValidData()"
          class="save-btn"
          [class.save-btn-disabled]="!simName().trim() || !store.hasValidData()">
          <span class="material-symbols-outlined text-base">save</span>
          <span class="hidden sm:inline" i18n="@@save.button">Guardar</span>
        </button>
      </div>
    </div>
  `,
  styles: `
    @reference "tailwindcss";

    .save-card {
      @apply p-4 rounded-xl;
      background: var(--glass-bg);
      border: 1px solid var(--glass-border);
      box-shadow: var(--glass-shadow);
    }

    .card-title {
      color: var(--color-text-primary);
    }

    .save-icon {
      @apply w-7 h-7 rounded-lg flex items-center justify-center;
      background: linear-gradient(135deg, #6366f1 0%, #06b6d4 100%);
    }

    .save-btn {
      @apply px-4 py-2.5 rounded-xl font-semibold text-white text-sm flex items-center gap-2 transition-all duration-200 cursor-pointer;
      background: linear-gradient(135deg, #6366f1 0%, #06b6d4 100%);
    }
    .save-btn:hover:not(.save-btn-disabled) {
      box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);
    }
    .save-btn-disabled {
      @apply opacity-50 cursor-not-allowed;
      background: var(--input-border);
      box-shadow: none !important;
    }
  `
})
export class SaveScenarioComponent {
  store = inject(SimulatorStore);
  private toastService = inject(ToastService);
  simName = signal('');

  save() {
    const name = this.simName().trim();
    if (!name) return;

    // Always create a new simulation with a new ID
    this.store.saveSimulation(name);
    this.simName.set('');
    this.toastService.success(`Escenario "${name}" guardado correctamente`);
  }
}