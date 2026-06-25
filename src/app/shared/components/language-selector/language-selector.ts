import { Component, Inject, LOCALE_ID, signal, ElementRef, HostListener } from '@angular/core';
import { DOCUMENT } from '@angular/common';

interface Locale {
  code: string;
  name: string;
}

@Component({
  selector: 'app-language-selector',
  standalone: true,
  imports: [],
  template: `
    <div class="relative group" (keydown.escape)="closeMenu()">
      <button 
        class="lang-btn"
        [attr.aria-label]="'Cambiar idioma' + ' (' + currentLocale().name + ')'"
        [attr.aria-expanded]="isOpen()"
        aria-haspopup="true"
        type="button"
        (click)="toggleMenu()">
        <span class="material-symbols-outlined text-xl">language</span>
        <span class="font-medium text-sm hidden sm:block uppercase">{{ currentLocale().code }}</span>
        <span class="material-symbols-outlined text-sm opacity-70 transition-transform duration-300" 
              [class.rotate-180]="isOpen()">expand_more</span>
      </button>

      <div class="dropdown-menu" [class.visible]="isOpen()">
        @for (locale of availableLocales; track locale.code) {
          <button 
            class="dropdown-item"
            [class.active]="locale.code === currentLocale().code"
            (click)="switchLanguage(locale.code)"
            [attr.tabindex]="isOpen() ? 0 : -1">
            <span class="text-sm font-medium uppercase w-6 text-center text-slate-400">{{ locale.code }}</span>
            <span class="text-sm font-medium">{{ locale.name }}</span>
            @if (locale.code === currentLocale().code) {
              <span class="material-symbols-outlined text-sm ml-auto text-indigo-500">check</span>
            }
          </button>
        }
      </div>
    </div>
  `,
  styles: `
    @reference "tailwindcss";

    .lang-btn {
      @apply flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: var(--color-text-primary);
      transition: all 0.3s ease;
    }

    .lang-btn:hover, .lang-btn[aria-expanded="true"] {
      background: rgba(255, 255, 255, 0.1);
      border-color: rgba(255, 255, 255, 0.2);
    }

    .dropdown-menu {
      @apply absolute right-0 top-full mt-2 w-48 rounded-xl opacity-0 invisible transform translate-y-2 flex flex-col overflow-hidden gap-1;
      background: var(--color-bg-card);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid var(--glass-border);
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      padding: 0.5rem;
      z-index: 50;
    }

    .dropdown-menu.visible {
      @apply opacity-100 visible translate-y-0;
    }

    .dropdown-item {
      @apply flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-left transition-colors;
      color: var(--color-text-primary);
    }

    .dropdown-item:hover {
      background: rgba(99, 102, 241, 0.1);
    }

    .dropdown-item.active {
      background: rgba(99, 102, 241, 0.15);
      color: #6366f1;
    }
  `
})
export class LanguageSelectorComponent {
  availableLocales: Locale[] = [
    { code: 'es', name: 'Español' },
    { code: 'ca', name: 'Català' },
    { code: 'gl', name: 'Galego' },
    { code: 'eu', name: 'Euskara' },
    { code: 'en', name: 'English' }
  ];

  currentLocale = signal<Locale>(this.availableLocales[0]);
  isOpen = signal(false);

  constructor(
    @Inject(LOCALE_ID) private localeId: string,
    @Inject(DOCUMENT) private document: Document,
    private elementRef: ElementRef
  ) {
    // Detect current locale from URL path first for better reliability
    const pathSegment = this.document.location.pathname.split('/')[1]?.toLowerCase();
    const foundByPath = this.availableLocales.find(l => l.code === pathSegment);

    if (foundByPath) {
      this.currentLocale.set(foundByPath);
    } else {
      // If no language prefix found, default to Spanish (or fallback to basic LOCALE_ID logic matching 'es')
      const esLocale = this.availableLocales.find(l => l.code === 'es');
      if (esLocale) {
        this.currentLocale.set(esLocale);
      }
    }
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isOpen.set(false);
    }
  }

  toggleMenu() {
    this.isOpen.update(v => !v);
  }

  closeMenu() {
    this.isOpen.set(false);
  }

  switchLanguage(targetLocale: string) {
    this.closeMenu();
    if (targetLocale === this.currentLocale().code) return;

    let newPath = this.document.location.pathname;

    // Check if the current path starts with any of the supported locales
    // and strip it. This handles cases where we are on a subpath like /es/ or /en/.
    for (const locale of this.availableLocales) {
      const regex = new RegExp(`^/${locale.code}(/|$)`);
      if (regex.test(newPath)) {
        newPath = newPath.replace(regex, '/');
        // Once found and replaced, we stop looking
        break;
      }
    }

    // Always add target locale prefix
    // Ensure path starts with slash
    if (!newPath.startsWith('/')) newPath = '/' + newPath;
    newPath = `/${targetLocale}${newPath === '/' ? '' : newPath}`;

    // Ensure trailing slash
    if (!newPath.endsWith('/')) newPath = newPath + '/';

    // Navigate
    this.document.location.href = newPath;
  }
}
