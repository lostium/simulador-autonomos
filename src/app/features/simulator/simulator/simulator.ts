import { Component, inject } from '@angular/core';
import { InputFormComponent } from '@app/features/simulator/components/input-form/input-form';
import { ResultsViewComponent } from '@app/features/simulator/components/results-view/results-view';
import { InfoViewComponent } from '@app/features/simulator/components/info-view/info-view';
import { SimulatorStore } from '@app/core/store/simulator.store';

@Component({
  selector: 'app-simulator',
  imports: [InputFormComponent, ResultsViewComponent, InfoViewComponent],
  host: {
    '(window:beforeunload)': 'onBeforeUnload($event)'
  },
  template: `
    <div class="max-w-5xl mx-auto px-4 py-8 space-y-8">
      
      <!-- Navigation Steps (only visible on data and results pages) -->
      @if (store.currentStep() > 0) {
        <nav class="flex justify-center">
          <div class="nav-container">
            @for (step of steps; track step.id; let i = $index) {
              <button 
                (click)="setStep(i)" 
                class="nav-step"
                [class.nav-step-active]="store.currentStep() === i"
                [class.nav-step-inactive]="store.currentStep() !== i && (i !== 2 || store.hasValidData())"
                [class.nav-step-disabled]="i === 2 && !store.hasValidData()"
                [disabled]="i === 2 && !store.hasValidData()">
                <span class="nav-icon" [class.nav-icon-active]="store.currentStep() === i">
                  <span class="material-symbols-outlined text-lg">{{ step.icon }}</span>
                </span>
                <span class="nav-label">{{ step.label }}</span>
              </button>
              @if (i < steps.length - 1) {
                <div class="nav-connector" [class.nav-connector-active]="store.currentStep() > i"></div>
              }
            }
          </div>
        </nav>
      }
      
      <!-- Step 0: Info -->
      @if (store.currentStep() === 0) {
        <div class="animate-fade-in">
          <app-info-view (start)="setStep(1)" />
        </div>
      }

      <!-- Step 1: Input Form -->
      @if (store.currentStep() === 1) {
        <div class="animate-fade-in">
          <app-input-form (goToResults)="setStep(2)" />
        </div>
      }
      
      <!-- Step 2: Results -->
      @if (store.currentStep() === 2) {
        <div class="animate-fade-in">
          <app-results-view />
        </div>
      }
      
    </div>
  `,
  styles: `
    @reference "tailwindcss";

    .nav-container {
      @apply flex items-center gap-2 p-2 rounded-2xl;
      background: var(--glass-bg);
      border: 1px solid var(--glass-border);
      box-shadow: var(--glass-shadow);
    }

    .nav-step {
      @apply flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-300 cursor-pointer;
      color: var(--color-text-secondary);
    }

    .nav-step-active {
      background: linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(6, 182, 212, 0.2) 100%);
      border: 1px solid rgba(99, 102, 241, 0.3);
      box-shadow: 0 4px 20px rgba(99, 102, 241, 0.2);
      color: var(--color-text-primary);
    }

    .nav-step-inactive {
      color: var(--color-text-muted);
    }
    .nav-step-inactive:hover {
      color: var(--color-text-primary);
      background: var(--glass-bg);
    }

    .nav-step-disabled {
      @apply cursor-not-allowed opacity-50;
      color: var(--color-text-muted);
    }

    .nav-icon {
      @apply w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300;
      background: var(--glass-bg);
      border: 1px solid var(--glass-border);
    }

    .nav-icon-active {
      background: linear-gradient(135deg, #6366f1 0%, #06b6d4 100%);
      box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4);
      border: none;
    }

    .nav-label {
      @apply hidden sm:inline;
    }

    .nav-connector {
      @apply w-8 h-0.5 rounded-full transition-all duration-300;
      background: var(--glass-border);
    }

    .nav-connector-active {
      background: linear-gradient(135deg, #6366f1 0%, #06b6d4 100%);
    }

    .animate-fade-in {
      animation: fadeIn 0.3s ease-out forwards;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `
})
export class SimulatorComponent {
  store = inject(SimulatorStore);

  steps = [
    { id: 0, label: $localize`:@@stepper.info:Info`, icon: 'info' },
    { id: 1, label: $localize`:@@stepper.data:Datos`, icon: 'edit_note' },
    { id: 2, label: $localize`:@@stepper.results:Resultados`, icon: 'analytics' }
  ];

  onBeforeUnload(event: BeforeUnloadEvent) {
    if (this.store.hasUnsavedChanges()) {
      event.preventDefault();
      event.returnValue = 'Tienes cambios sin guardar. ¿Estás seguro de que quieres salir?';
    }
  }

  setStep(step: number) {
    this.store.setStep(step);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
