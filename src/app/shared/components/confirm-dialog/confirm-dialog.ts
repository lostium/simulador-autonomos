import { Component, inject } from '@angular/core';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
}

@Component({
  selector: 'app-confirm-dialog',
  template: `
    <div class="confirm-modal animate-in fade-in zoom-in duration-200">
      <div class="modal-header">
        <h3 class="text-xl font-bold text-themed">{{ data.title }}</h3>
      </div>
      
      <div class="modal-body py-4">
        <p class="text-themed-secondary leading-relaxed">{{ data.message }}</p>
      </div>
      
      <div class="modal-footer flex justify-end gap-3 mt-2">
        <button 
          (click)="dialogRef.close(false)" 
          class="px-4 py-2 rounded-xl font-semibold text-themed-secondary hover:bg-white/5 transition-colors cursor-pointer">
          {{ data.cancelText || 'Cancelar' }}
        </button>
        <button 
          (click)="dialogRef.close(true)" 
          [class.btn-danger]="data.danger"
          [class.btn-primary-simple]="!data.danger"
          class="px-6 py-2 rounded-xl font-bold text-white transition-all cursor-pointer">
          {{ data.confirmText || 'Confirmar' }}
        </button>
      </div>
    </div>
  `,
  styles: `
    @reference "tailwindcss";

    .confirm-modal {
      @apply p-6 rounded-3xl max-w-sm w-full mx-4 shadow-2xl border;
      background: var(--color-bg-card-solid);
      border-color: var(--glass-border);
    }

    .btn-danger {
      background: linear-gradient(135deg, #f43f5e 0%, #e11d48 100%);
      box-shadow: 0 4px 15px rgba(244, 63, 94, 0.3);
    }
    .btn-danger:hover {
      box-shadow: 0 6px 20px rgba(244, 63, 94, 0.4);
      transform: translateY(-1px);
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
export class ConfirmDialogComponent {
  dialogRef = inject(DialogRef<boolean>);
  data = inject<ConfirmDialogData>(DIALOG_DATA);
}
