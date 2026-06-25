import { Component, output, signal, ChangeDetectionStrategy } from '@angular/core';
import { Toast } from './toast.service';

@Component({
  selector: 'app-toast',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="toast"
      [class.toast-success]="toast.type === 'success'"
      [class.toast-error]="toast.type === 'error'"
      [class.toast-info]="toast.type === 'info'"
      [class.toast-leaving]="isLeaving()">
      <div class="toast-icon">
        @switch (toast.type) {
          @case ('success') {
            <span class="material-symbols-outlined">check_circle</span>
          }
          @case ('error') {
            <span class="material-symbols-outlined">error</span>
          }
          @case ('info') {
            <span class="material-symbols-outlined">info</span>
          }
        }
      </div>
      <span class="toast-message">{{ toast.message }}</span>
      <button class="toast-close" (click)="triggerClose()" aria-label="Cerrar notificación" i18n-aria-label="@@toast.close">
        <span class="material-symbols-outlined text-sm">close</span>
      </button>
    </div>
  `,
  host: {
    '(animationend)': 'onAnimationEnd($event)'
  },
  styles: `
    @reference "tailwindcss";

    .toast {
      @apply flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl min-w-72 max-w-md;
      background: var(--glass-bg);
      border: 1px solid var(--glass-border);
      backdrop-filter: blur(16px);
      animation: slideInUp 0.3s ease-out forwards;
    }

    .toast-leaving {
      animation: slideOutDown 0.3s ease-in forwards;
    }

    .toast-success {
      border-left: 4px solid #10b981;
    }
    .toast-success .toast-icon {
      color: #10b981;
    }

    .toast-error {
      border-left: 4px solid #f43f5e;
    }
    .toast-error .toast-icon {
      color: #f43f5e;
    }

    .toast-info {
      border-left: 4px solid #6366f1;
    }
    .toast-info .toast-icon {
      color: #6366f1;
    }

    .toast-message {
      @apply flex-1 text-sm font-medium;
      color: var(--color-text-primary);
    }

    .toast-close {
      @apply p-1 rounded-lg transition-colors duration-200 cursor-pointer;
      color: var(--color-text-muted);
    }
    .toast-close:hover {
      background: var(--table-row-hover);
      color: var(--color-text-primary);
    }

    @keyframes slideInUp {
      from {
        opacity: 0;
        transform: translateY(100%);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes slideOutDown {
      from {
        opacity: 1;
        transform: translateY(0);
      }
      to {
        opacity: 0;
        transform: translateY(100%);
      }
    }
  `
})
export class ToastComponent {
  toast!: Toast;
  close = output<void>();
  animationDone = output<void>();

  isLeaving = signal(false);

  triggerClose() {
    this.isLeaving.set(true);
  }

  onAnimationEnd(event: AnimationEvent) {
    if (event.animationName.includes('slideOutDown')) {
      this.animationDone.emit();
    }
  }
}
