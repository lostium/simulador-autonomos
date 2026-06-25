import { Component, inject } from '@angular/core';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';

export interface SaveConflictData {
  name: string;
}

export type SaveConflictResult = 'overwrite' | 'new' | 'cancel';

@Component({
  selector: 'app-save-conflict-dialog',
  template: `
    <div class="confirm-modal animate-in fade-in zoom-in duration-200">
      <div class="modal-header">
        <h3 class="text-xl font-bold text-themed">Escenario duplicado</h3>
      </div>
      
      <div class="modal-body py-4">
        <p class="text-themed-secondary leading-relaxed">
          Ya existe una simulación guardada con el nombre <strong>"{{ data.name }}"</strong>. 
          ¿Qué prefieres hacer?
        </p>
      </div>
      
      <div class="modal-footer flex flex-col sm:flex-row justify-end gap-2 mt-2">
        <button 
          (click)="dialogRef.close('cancel')" 
          class="px-4 py-2 rounded-xl font-semibold text-themed-secondary hover:bg-white/5 transition-colors cursor-pointer order-3 sm:order-1">
          Cancelar
        </button>
        <button 
          (click)="dialogRef.close('new')" 
          class="px-4 py-2 rounded-xl font-semibold bg-white/5 text-themed hover:bg-white/10 transition-colors cursor-pointer order-2">
          Añadir como nueva
        </button>
        <button 
          (click)="dialogRef.close('overwrite')" 
          class="px-6 py-2 rounded-xl font-bold text-white btn-primary-simple transition-all cursor-pointer order-1 sm:order-3">
          Sobrescribir
        </button>
      </div>
    </div>
  `,
  styles: `
    @reference "tailwindcss";

    .confirm-modal {
      @apply p-6 rounded-3xl max-w-md w-full mx-4 shadow-2xl border;
      background: var(--color-bg-card-solid);
      border-color: var(--glass-border);
    }

    .btn-primary-simple {
      background: linear-gradient(135deg, #6366f1 0%, #06b6d4 100%);
      box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);
    }
    .btn-primary-simple:hover {
      box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
      transform: translateY(-1px);
    }
  `
})
export class SaveConflictDialogComponent {
  dialogRef = inject(DialogRef<SaveConflictResult>);
  data = inject<SaveConflictData>(DIALOG_DATA);
}
