import { Component, inject } from '@angular/core';
import { ThemeService } from '@app/core/services/theme.service';
import { HeaderStatsComponent } from './header-stats.component';

import { LanguageSelectorComponent } from '../language-selector/language-selector';

@Component({
  selector: 'app-header',
  imports: [HeaderStatsComponent, LanguageSelectorComponent],
  template: `
    <header class="header-glass">
      <div class="max-w-6xl mx-auto flex items-center justify-between gap-2 md:gap-4">
        <!-- Logo & Title -->
        <div class="flex items-center gap-2 md:gap-4">
          <div class="logo-icon">
            <span class="material-symbols-outlined text-2xl">savings</span>
          </div>
          <div>
            <h1 class="text-lg md:text-xl font-bold tracking-tight">
              <span i18n="@@header.title">Simulador Renta </span><span class="gradient-text">2025</span>
            </h1>
            <p class="subtitle" i18n="@@header.subtitle">Para Autónomos en España</p>
          </div>
        </div>
        
        <!-- Summary Stats (Desktop) -->
        <div class="flex items-center gap-3">
          <app-header-stats />
          
          <div class="h-6 w-px bg-slate-200/20 hidden sm:block"></div>

          <app-language-selector />
                    
          <!-- Theme Toggle Switch -->
          <button 
            class="theme-switch"
            (click)="themeService.toggleTheme()"
            [attr.aria-label]="themeService.isDark() ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'"
            i18n-aria-label="@@header.themeToggle"
            type="button">
            <span class="switch-track" [class.light]="!themeService.isDark()">
              <span class="switch-thumb" [class.light]="!themeService.isDark()">
                @if (themeService.isDark()) {
                  <span class="material-symbols-outlined">dark_mode</span>
                } @else {
                  <span class="material-symbols-outlined">light_mode</span>
                }
              </span>
            </span>
          </button>
        </div>
      </div>
    </header>
  `,
  styles: `
    @reference "tailwindcss";

    .header-glass {
      @apply py-4 px-4 sticky top-0 z-30;
      background: var(--gradient-header);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border-bottom: 1px solid var(--glass-border);
      box-shadow: 0 4px 30px rgba(0, 0, 0, 0.3);
      transition: background 0.3s ease, border-color 0.3s ease;
    }

    .logo-icon {
      @apply w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center;
      background: linear-gradient(135deg, #6366f1 0%, #06b6d4 100%);
      box-shadow: 0 4px 20px rgba(99, 102, 241, 0.4);
    }

    .gradient-text {
      background: linear-gradient(135deg, #6366f1 0%, #06b6d4 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .subtitle {
      @apply hidden sm:block text-xs font-medium;
      color: var(--color-text-muted);
    }

    .regime-badge {
      @apply px-4 py-2 rounded-full text-xs hidden sm:block;
      background: var(--glass-bg);
      border: 1px solid var(--glass-border);
      transition: background 0.3s ease, border-color 0.3s ease;
    }

    .regime-label {
      color: var(--color-text-muted);
    }

    .regime-value {
      @apply font-semibold ml-1;
      color: var(--color-text-primary);
    }

    /* Theme Switch Styles */
    .theme-switch {
      @apply cursor-pointer;
      background: transparent;
      border: none;
      padding: 0;
    }

    .theme-switch:focus-visible {
      outline: 2px solid var(--color-primary);
      outline-offset: 2px;
      border-radius: 9999px;
    }

    .switch-track {
      @apply relative flex items-center;
      width: 56px;
      height: 30px;
      border-radius: 9999px;
      background: linear-gradient(135deg, #312e81 0%, #1e1b4b 100%);
      border: 1px solid rgba(255, 255, 255, 0.15);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .switch-track.light {
      background: linear-gradient(135deg, #93c5fd 0%, #60a5fa 100%);
      border-color: rgba(0, 0, 0, 0.1);
    }

    .switch-thumb {
      @apply absolute flex items-center justify-center;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: linear-gradient(135deg, #6366f1 0%, #818cf8 100%);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
      right: 3px;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .switch-thumb.light {
      right: calc(100% - 27px);
      background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%);
      box-shadow: 0 2px 8px rgba(245, 158, 11, 0.4);
    }

    .switch-thumb .material-symbols-outlined {
      font-size: 16px;
      color: #fff;
      line-height: 1;
    }
  `
})
export class HeaderComponent {
  readonly themeService = inject(ThemeService);
}
