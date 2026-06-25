import { Component, signal, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-disclaimer-banner',
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (isExpanded()) {
      <div class="disclaimer-banner animate-slide-down">
        <div class="banner-content">
          <div class="flex items-start gap-4">
            <div class="disclaimer-icon">
              <span class="material-symbols-outlined">warning</span>
            </div>
            <div class="flex-1">
              <p class="font-bold text-amber-200 mb-1" i18n="@@disclaimer.title">Aviso Importante</p>
              <p class="text-amber-100/80 text-sm leading-relaxed" i18n="@@disclaimer.text">
                Este simulador es un <strong>experimento de Lostium</strong> hecho con <strong>vibe coding</strong> y no ofrece ningún tipo de garantía. 
                En ningún caso hay fiabilidad de que los datos mostrados sean correctos para tu caso particular.
                Además, este simulador <strong>no contempla los regímenes forales de País Vasco y Navarra</strong>, ya que disponen de haciendas propias y normativa fiscal específica.
              </p>
            </div>
            <button 
              class="close-btn"
              (click)="close()"
              aria-label="Cerrar aviso" i18n-aria-label="@@disclaimer.close">
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>
        </div>
      </div>
    } @else {
      <button 
        class="warning-toggle animate-fade-in"
        (click)="open()"
        aria-label="Mostrar aviso importante" i18n-aria-label="@@disclaimer.open">
        <span class="material-symbols-outlined">warning</span>
      </button>
    }
  `,
  styles: `
    @reference "tailwindcss";

    .disclaimer-banner {
      @apply w-full;
      background: linear-gradient(135deg, rgba(180, 83, 9, 0.95) 0%, rgba(146, 64, 14, 0.95) 100%);
      border-bottom: 1px solid rgba(251, 191, 36, 0.3);
    }

    .banner-content {
      @apply max-w-6xl mx-auto px-4 py-3;
    }

    .disclaimer-icon {
      @apply w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0;
      background: rgba(251, 191, 36, 0.25);
      color: #fde047;
    }

    .close-btn {
      @apply w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-200 cursor-pointer;
      background: rgba(255, 255, 255, 0.1);
      color: #fef3c7;
    }
    
    .close-btn:hover {
      background: rgba(255, 255, 255, 0.2);
      transform: scale(1.05);
    }
    
    .close-btn:active {
      transform: scale(0.95);
    }

    .warning-toggle {
      @apply fixed top-20 right-4 z-40 w-12 h-12 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300;
      background: linear-gradient(135deg, rgba(180, 83, 9, 0.95) 0%, rgba(146, 64, 14, 0.95) 100%);
      border: 1px solid rgba(251, 191, 36, 0.4);
      color: #fde047;
      box-shadow: 0 4px 20px rgba(180, 83, 9, 0.4);
    }
    
    .warning-toggle:hover {
      transform: scale(1.1);
      box-shadow: 0 6px 25px rgba(180, 83, 9, 0.5);
    }
    
    .warning-toggle:active {
      transform: scale(1);
    }

    .animate-slide-down {
      animation: slideDown 0.3s ease-out;
    }

    .animate-fade-in {
      animation: fadeIn 0.3s ease-out;
    }

    @keyframes slideDown {
      from {
        opacity: 0;
        transform: translateY(-100%);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: scale(0.8);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }
  `
})
export class DisclaimerBannerComponent {
  isExpanded = signal(true);

  close() {
    this.isExpanded.set(false);
  }

  open() {
    this.isExpanded.set(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
