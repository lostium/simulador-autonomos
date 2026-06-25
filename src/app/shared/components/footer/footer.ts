import { Component } from '@angular/core';
import packageJson from '../../../../../package.json';

@Component({
    selector: 'app-footer',
    standalone: true,
    template: `
    <footer class="mt-8 py-6 text-center text-sm text-slate-400 border-t border-slate-700/50">
      <div class="container mx-auto px-4 flex flex-col md:flex-row justify-center items-center gap-4">
        <p>
          Simulador de Autónomos <span class="font-mono text-xs opacity-70">v{{ version }}</span>
        </p>
        <span class="hidden md:inline text-slate-600">•</span>
        <p>
          Una herramienta experimental de
          <a
            href="https://lostium.com"
            target="_blank"
            rel="noopener noreferrer"
            class="text-accent hover:text-accent-light transition-colors font-medium decoration-none hover:underline"
          >
            Lostium
          </a>
        </p>
      </div>
    </footer>
  `,
})
export class FooterComponent {
    version = packageJson.version;
}
