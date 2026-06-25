import { Component, inject, signal, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { SimulatorStore, SavedSimulation } from '@app/core/store/simulator.store';
import { ToastService } from '@app/shared/components/toast/toast.service';
import { Dialog } from '@angular/cdk/dialog';
import { ConfirmDialogComponent } from '@app/shared/components/confirm-dialog/confirm-dialog';
import { SaveConflictDialogComponent, SaveConflictResult } from '@app/shared/components/confirm-dialog/save-conflict-dialog';

@Component({
  selector: 'app-scenario-history',
  imports: [DatePipe],
  template: `
    <div class="history-wrapper mb-6">
      @if (!isExpanded()) {
        <div class="flex justify-end">
          <button 
            (click)="toggleExpanded()" 
            class="minimal-history-btn">
            <span class="material-symbols-outlined">history</span>
          </button>
        </div>
      } @else {
        <div class="history-card w-full">
          <!-- Collapsible Header -->
          <button 
            (click)="toggleExpanded()" 
            class="history-header group">
            <div class="flex items-center gap-2">
              <div class="history-icon">
                <span class="material-symbols-outlined text-sm">history</span>
              </div>
              <h4 class="text-sm font-bold card-title" i18n="@@history.title">Historial</h4>
              @if (store.savedSimulations().length > 0) {
                <span class="badge">{{ store.savedSimulations().length }}</span>
              }
            </div>
            <span 
              class="material-symbols-outlined text-lg transition-transform duration-300"
              [class.rotate-180]="isExpanded()">
              expand_more
            </span>
          </button>
          
          <!-- Expandable Content -->
          @if (isExpanded()) {
            <div class="history-content">
              <div class="flex justify-end gap-1 mb-3">
                @if (store.savedSimulations().length > 0) {
                  <button (click)="store.exportSimulations()" class="action-btn" title="Exportar" i18n-title="@@history.btn.export.title">
                    <span class="material-symbols-outlined text-sm">download</span>
                  </button>
                  <button (click)="fileInput.click()" class="action-btn" title="Importar" i18n-title="@@history.btn.import.title">
                    <span class="material-symbols-outlined text-sm">upload</span>
                  </button>
                  <button (click)="clearAll()" class="action-btn text-rose-400 hover:bg-rose-500/10" title="Eliminar todo" i18n-title="@@history.btn.clearAll.title">
                    <span class="material-symbols-outlined text-sm">delete_forever</span>
                  </button>
                }
                <input #fileInput type="file" class="hidden" accept=".json" (change)="importSims($event)" />
              </div>
              
              <div class="space-y-2 max-h-64 overflow-y-auto pr-1">
                @for (sim of store.savedSimulations(); track sim.id) {
                  <div 
                    (click)="store.loadSimulation(sim.id)"
                    (keydown.enter)="store.loadSimulation(sim.id)"
                    (keydown.space)="$event.preventDefault(); store.loadSimulation(sim.id)"
                    tabindex="0"
                    role="button"
                    [attr.aria-label]="'Cargar simulación ' + sim.name"
                    class="sim-item group cursor-pointer focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500">
                    <div class="overflow-hidden">
                      <div class="font-semibold sim-name text-sm truncate">{{ sim.name }}</div>
                      <div class="text-xs sim-date">{{ sim.date | date:'shortDate' }}</div>
                    </div>
                    <div class="flex gap-1 opacity-50 group-hover:opacity-100 transition-opacity">
                      <button 
                        (click)="exportSim($event, sim.id)" 
                        class="sim-action-btn text-indigo-400 hover:bg-indigo-500/20" 
                        title="Exportar esta simulación" i18n-title="@@history.btn.exportOne.title">
                        <span class="material-symbols-outlined text-base">download</span>
                      </button>
                      <button 
                        (click)="deleteSim($event, sim.id, sim.name)" 
                        class="sim-action-btn text-rose-400 hover:bg-rose-500/20" 
                        title="Eliminar" i18n-title="@@history.btn.delete.title">
                        <span class="material-symbols-outlined text-base">delete</span>
                      </button>
                    </div>
                  </div>
                } @empty {
                  <!-- Drop Zone -->
                  <div 
                    class="drop-zone"
                    [class.drop-zone-active]="isDragging()"
                    (dragover)="onDragOver($event)"
                    (dragleave)="onDragLeave($event)"
                    (drop)="onDrop($event)"
                    (click)="fileInput.click()">
                    <div class="drop-zone-content">
                      <div class="drop-icon-wrapper">
                        <span class="material-symbols-outlined text-4xl">cloud_upload</span>
                      </div>
                      <p class="font-bold text-themed mb-1" i18n="@@history.import.title">Importar Simulaciones</p>
                      <p class="text-xs text-themed-muted" i18n="@@history.import.subtitle">
                        Arrastra tus archivos JSON aquí o haz clic para buscarlos
                      </p>
                    </div>
                  </div>
                }
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: `
    @reference "tailwindcss";

    .history-wrapper {
      @apply relative min-h-[40px];
    }

    .minimal-history-btn {
      @apply w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 cursor-pointer;
      background: var(--glass-bg);
      border: 1px solid var(--glass-border);
      color: var(--color-text-muted);
      box-shadow: var(--glass-shadow);
    }
    .minimal-history-btn:hover {
      @apply text-indigo-400 border-indigo-500/30;
      background: rgba(99, 102, 241, 0.1);
    }

    .history-card {
      @apply rounded-xl overflow-hidden;
      background: var(--glass-bg);
      border: 1px solid var(--glass-border);
      box-shadow: var(--glass-shadow);
    }

    .history-header {
      @apply w-full p-4 flex justify-between items-center cursor-pointer transition-colors duration-200;
      color: var(--color-text-primary);
    }
    .history-header:hover {
      background: var(--table-row-hover);
    }

    .history-icon {
      @apply w-7 h-7 rounded-lg flex items-center justify-center;
      background: linear-gradient(135deg, #6366f1 0%, #06b6d4 100%);
    }

    .card-title {
      color: var(--color-text-primary);
    }

    .badge {
      @apply text-xs font-bold px-2 py-0.5 rounded-full;
      background: rgba(99, 102, 241, 0.2);
      color: #a5b4fc;
    }

    .history-content {
      @apply px-4 pb-4;
      border-top: 1px solid var(--glass-border);
    }

    .action-btn {
      @apply p-2 rounded-lg transition-colors duration-200 cursor-pointer;
      color: var(--color-text-muted);
    }
    .action-btn:hover {
      @apply text-indigo-400;
      background: rgba(99, 102, 241, 0.1);
    }

    .sim-item {
      @apply p-3 rounded-xl flex justify-between items-center transition-all duration-200;
      background: var(--table-row-alt);
      border: 1px solid var(--glass-border);
    }
    .sim-item:hover {
      background: var(--table-row-hover);
      border-color: rgba(99, 102, 241, 0.2);
    }

    .sim-name {
      color: var(--color-text-primary);
    }
    .sim-date {
      color: var(--color-text-muted);
    }

    .sim-action-btn {
      @apply p-1.5 rounded-lg transition-all duration-200 cursor-pointer;
    }

    /* Drop Zone Styles */
    .drop-zone {
      @apply py-8 px-4 border-2 border-dashed rounded-2xl transition-all duration-300 cursor-pointer text-center;
      border-color: var(--glass-border);
      background: rgba(255, 255, 255, 0.01);
    }
    .drop-zone:hover, .drop-zone-active {
      @apply border-indigo-500/50;
      background: rgba(99, 102, 241, 0.05);
    }
    .drop-zone-active {
      @apply scale-[0.98] border-solid border-indigo-500;
    }

    .drop-icon-wrapper {
      @apply w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 transition-transform duration-300;
      background: rgba(99, 102, 241, 0.1);
      color: var(--color-primary);
    }

    /* --- ANIMATIONS --- */
    .fade-in { animation: fadeIn 0.2s ease-out; }
    .fade-out { animation: fadeOut 0.2s ease-in forwards; }
    .fade-out-abs { 
      animation: fadeOut 0.2s ease-in forwards; 
      position: absolute;
      right: 0;
      top: 0;
    }
    .card-appear { animation: cardAppear 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes fadeOut {
      from { opacity: 1; }
      to { opacity: 0; }
    }
    @keyframes cardAppear {
      from { opacity: 0; transform: scale(0.95) translateY(-10px); }
      to { opacity: 1; transform: scale(1) translateY(0); }
    }
  `
})
export class ScenarioHistoryComponent implements OnInit {
  store = inject(SimulatorStore);
  private toastService = inject(ToastService);
  private dialog = inject(Dialog);

  isExpanded = signal(false);
  isDragging = signal(false);

  ngOnInit() {
    this.store.loadFromStorage();
  }

  toggleExpanded() {
    this.isExpanded.update(v => !v);
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(true);
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);

    const files = event.dataTransfer?.files;
    if (files?.length) {
      this.handleFile(files[0]);
    }
  }

  exportSim(event: Event, id: string) {
    event.stopPropagation();
    this.store.exportSingleSimulation(id);
    this.toastService.info('Exportando simulación...');
  }

  deleteSim(event: Event, id: string, name: string) {
    event.stopPropagation();

    const dialogRef = this.dialog.open<boolean>(ConfirmDialogComponent, {
      data: {
        title: '¿Eliminar escenario?',
        message: `¿Estás seguro de que quieres eliminar "${name}"? Esta acción no se puede deshacer.`,
        confirmText: 'Eliminar',
        danger: true
      }
    });

    dialogRef.closed.subscribe(result => {
      if (result) {
        this.store.deleteSimulation(id);
        this.toastService.info('Escenario eliminado');
      }
    });
  }

  clearAll() {
    const dialogRef = this.dialog.open<boolean>(ConfirmDialogComponent, {
      data: {
        title: '¿Eliminar todo el historial?',
        message: 'Esta acción borrará todas las simulaciones guardadas y no se puede deshacer.',
        confirmText: 'Sí, borrar todo',
        danger: true
      }
    });

    dialogRef.closed.subscribe(result => {
      if (result) {
        this.store.clearHistory();
        this.toastService.info('Historial eliminado por completo');
      }
    });
  }

  importSims(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.handleFile(input.files[0]);
      input.value = '';
    }
  }

  private handleFile(file: File) {
    if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
      this.toastService.error('Por favor, selecciona un archivo JSON válido');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string);
        if (Array.isArray(imported)) {
          this.processImportedSims(imported);
        } else {
          this.toastService.error('El formato del archivo no es correcto');
        }
      } catch (err) {
        this.toastService.error('Error al leer el archivo JSON');
      }
    };
    reader.readAsText(file);
  }

  private async processImportedSims(sims: SavedSimulation[]) {
    for (const sim of sims) {
      const existing = this.store.savedSimulations().find(s => s.name.toLowerCase() === sim.name.toLowerCase());

      if (existing) {
        const dialogRef = this.dialog.open<SaveConflictResult>(SaveConflictDialogComponent, {
          data: { name: sim.name }
        });

        const result = await new Promise<SaveConflictResult>(resolve => {
          dialogRef.closed.subscribe(res => resolve(res || 'cancel'));
        });

        if (result === 'overwrite') {
          this.store.updateImportedSimulation(existing.id, sim);
          this.toastService.success(`Escenario "${sim.name}" sobrescrito`);
        } else if (result === 'new') {
          this.store.addImportedSimulation(sim);
          this.toastService.success(`Escenario "${sim.name}" añadido como nuevo`);
        }
      } else {
        this.store.addImportedSimulation(sim);
        this.toastService.success(`Escenario "${sim.name}" importado correctamente`);
      }
    }
  }
}
