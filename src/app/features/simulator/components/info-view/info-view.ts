import { Component, output } from '@angular/core';

@Component({
  selector: 'app-info-view',
  imports: [],
  template: `
    <div class="space-y-8 animate-fade-in text-left">
      
      <!-- Hero Section -->
      <div class="text-center py-8">
        <h2 class="text-4xl md:text-5xl font-extrabold mb-8 leading-tight">
          <span i18n="@@info.hero.title">Calcula tu </span><span class="gradient-text" i18n="@@info.hero.mode">IRPF y cuota de autónomos de 2025</span>
        </h2>
        
        <div class="hero-story space-y-4 text-left max-w-3xl mx-auto leading-relaxed text-slate-300">
          <p i18n="@@info.hero.description.purpose">
            Este <strong>simulador simplificado</strong> es un <strong>experimento de Lostium</strong> que realiza una estimación de tu IRPF basándose en tus <strong>ingresos, retenciones y deducciones principales</strong>. También calcula automáticamente tu <strong>cuota de autónomos de 2025</strong> (el año pasado) bajo el sistema de cotización por ingresos reales.
          </p>
          <p i18n="@@info.hero.description.origin">
            Surge de la necesidad de prever el resultado de la Declaración de la Renta de forma ágil, sin depender de complejas hojas de cálculo. Aunque fue concebido para <strong>autónomos societarios</strong> en estimación directa simplificada, su lógica es útil para cualquier trabajador por cuenta propia.
          </p>
        </div>
      </div>

      <!-- CTA Button -->
      <button 
        (click)="start.emit()" 
        class="cta-button group">
        <span class="text-lg" i18n="@@info.cta.button">Comenzar Simulación</span>
        <span class="material-symbols-outlined transition-transform duration-300 group-hover:translate-x-1">arrow_forward</span>
      </button>

      <!-- FAQ Section -->
      <div class="glass-card-section">
        <div class="section-header">
          <span class="material-symbols-outlined text-cyan-400">school</span>
          <h3 class="text-xl font-bold" i18n="@@info.faq.title">El IRPF explicado para humanos</h3>
        </div>

        <div class="space-y-3">
          <details class="faq-item group">
            <summary class="faq-summary">
              <span class="font-semibold" i18n="@@info.faq.q2.title">1. ¿Sobre qué beneficios aportas? (La base)</span>
              <span class="material-symbols-outlined transition-transform duration-300 group-open:rotate-180">expand_more</span>
            </summary>
            <div class="faq-content">
              <p class="mb-3" i18n="@@info.faq.q2.content.intro">No pagas impuestos por todo lo que facturas, sino solo por lo que realmente ganas (tu beneficio real). Para calcular tu capacidad de aportación:</p>
              <ul class="list-disc pl-5 space-y-2">
                <li i18n="@@info.faq.q2.content.list.expenses">Restamos los gastos necesarios para tu actividad: cuota de autónomos, servicios, seguro médico, etc.</li>
                <li i18n="@@info.faq.q2.content.list.diff">Se aplica un descuento automático del 5% para cubrir esos pequeños gastos difíciles de justificar.</li>
                <li i18n="@@info.faq.q2.content.list.reduction">Si tus beneficios son ajustados, cuentas con una reducción extra de apoyo.</li>
              </ul>
              <p class="mt-3" i18n="@@info.faq.q2.content.summary">El resultado es la <strong>Base Liquidable</strong>, que representa tu capacidad económica real y sobre la que se calcula tu contribución.</p>
            </div>
          </details>

          <details class="faq-item group">
            <summary class="faq-summary">
              <span class="font-semibold" i18n="@@info.faq.q_reta.title">2. La Cuota de Autónomos (RETA) de 2025</span>
              <span class="material-symbols-outlined transition-transform duration-300 group-open:rotate-180">expand_more</span>
            </summary>
            <div class="faq-content">
              <p i18n="@@info.faq.q_reta.content">
                El simulador incorpora automáticamente el cálculo de la cuota según el sistema de ingresos reales que aplicó durante el año pasado (2025). Al introducir tu previsión de ingresos, la herramienta estima la cuota mínima del tramo que te correspondió y la resta como un gasto deducible para mayor precisión en el cálculo final.
              </p>
            </div>
          </details>

          <details class="faq-item group">
            <summary class="faq-summary">
              <span class="font-semibold" i18n="@@info.faq.q3.title">3. La escalera de los impuestos (Los tramos)</span>
              <span class="material-symbols-outlined transition-transform duration-300 group-open:rotate-180">expand_more</span>
            </summary>
            <div class="faq-content">
              <p class="mb-3" i18n="@@info.faq.q3.content.intro">El IRPF funciona por escalones. No pagas lo mismo por el primer euro que ganas que por el último:</p>
              <ul class="list-disc pl-5 space-y-2">
                <li i18n="@@info.faq.q3.content.list.low">Los primeros euros pagan poquito.</li>
                <li i18n="@@info.faq.q3.content.list.high">Si ganas mucho, los últimos euros pagan bastante más (casi la mitad).</li>
              </ul>
              <p class="mt-3" i18n="@@info.faq.q3.content.summary">Además, el impuesto tiene dos dueños: la mitad va para el <strong>Estado</strong> y la otra mitad para tu <strong>Comunidad Autónoma</strong>. Por eso, dependiendo de dónde vivas, la factura final cambia.</p>
            </div>
          </details>

          <details class="faq-item group">
            <summary class="faq-summary">
              <span class="font-semibold" i18n="@@info.faq.q4.title">4. Tu mínimo vital está protegido (Mínimos)</span>
              <span class="material-symbols-outlined transition-transform duration-300 group-open:rotate-180">expand_more</span>
            </summary>
            <div class="faq-content">
              <p i18n="@@info.faq.q4.content.p1">El sistema reconoce que una parte de tus ingresos es esencial para cubrir tus necesidades básicas y las de tu familia, por lo que esa cantidad queda exenta de tributación.</p>
              <p class="mt-3" i18n="@@info.faq.q4.content.p2">Partimos de unos <strong>5.550€</strong> iniciales, cifra que aumenta si tienes hijos a cargo o según tu edad. En la práctica, se calcula el impuesto que correspondería a esa cantidad y se resta de tu cuota, garantizando que ese mínimo vital no tribute.</p>
            </div>
          </details>

          <details class="faq-item group">
            <summary class="faq-summary">
              <span class="font-semibold" i18n="@@info.faq.q5.title">5. La cuenta final: ¿Pagar o devolver?</span>
              <span class="material-symbols-outlined transition-transform duration-300 group-open:rotate-180">expand_more</span>
            </summary>
            <div class="faq-content">
              <p class="mb-3" i18n="@@info.faq.q5.content.intro">Llega la hora de la verdad. Calculamos el impuesto total y miramos qué has pagado ya:</p>
              <ul class="list-disc pl-5 space-y-2">
                <li i18n="@@info.faq.q5.content.list.retentions">Restamos las <strong>Retenciones</strong>. Lo habitual es haber adelantado un 15% en tus facturas, aunque si eres "nuevo autónomo" (primeros 3 años) será solo un 7%. También puedes indicar la cantidad exacta que has aportado si llevas tu propia contabilidad.</li>
                <li i18n="@@info.faq.q5.content.list.deductions">Restamos deducciones si eres solidario (donaciones a ONGs).</li>
              </ul>
              <p class="mt-3" i18n="@@info.faq.q5.content.result">Si has adelantado más dinero del que te tocaba, Hacienda te <span class="text-emerald-400 font-bold">devuelve</span> la diferencia. Si te has quedado corto... toca <span class="text-rose-400 font-bold">pagar</span>.</p>
            </div>
          </details>

          <details class="faq-item group">
            <summary class="faq-summary">
              <span class="font-semibold" i18n="@@info.faq.q1.title">6. El IVA: un dinero que nunca fue tuyo</span>
              <span class="material-symbols-outlined transition-transform duration-300 group-open:rotate-180">expand_more</span>
            </summary>
            <div class="faq-content">
              <p class="mb-3" i18n="@@info.faq.q1.content.p1">Antes de empezar, aclaremos el error más común: el IVA <strong>no pinta nada aquí</strong>. No es un ingreso, es un impuesto al consumo que paga tu cliente.</p>
              <p i18n="@@info.faq.q1.content.p2">Tú actúas simplemente como un "recaudador" temporal: lo cobras y luego se lo entregas intacto a Hacienda. No entra en el cálculo de tus beneficios ni del IRPF.</p>
              <p class="mt-3 text-indigo-400 font-medium" i18n="@@info.faq.q1.content.rule">Regla de oro: Para usar este simulador (y para tu vida), mira siempre la <strong>Base Imponible</strong> de tus facturas, nunca el total con IVA.</p>
            </div>
          </details>
        </div>
      </div>



      <!-- Technical Details Section -->
      <div class="glass-card-section animate-fade-in delay-100">
        <div class="section-header">
          <span class="material-symbols-outlined text-indigo-400">terminal</span>
          <h3 class="text-xl font-bold" i18n="@@info.tech.title">Consideraciones técnicas</h3>
        </div>

        <div class="space-y-3">
          <details class="faq-item group">
            <summary class="faq-summary">
              <span class="font-semibold" i18n="@@info.tech.vibecoding.title">Vibe Coding: un nuevo paradigma</span>
              <span class="material-symbols-outlined transition-transform duration-300 group-open:rotate-180">expand_more</span>
            </summary>
            <div class="faq-content">
              <p i18n="@@info.tech.vibecoding.content">
                Este proyecto es un caso práctico de <strong class="text-indigo-400">Vibe Coding</strong>: el desarrollo de aplicaciones se potencia y acelera con un modelo de inteligencia artificial. Elimina las partes más tediosas de la implementación y nos permite centrarnos en lo que importa, buscar soluciones que resuelvan problemas. En este caso hemos utilizado herramientas como <strong>Google Antigravity</strong> y <strong>Gemini CLI</strong> utilizando agentes en paralelo que han implementado todos los detalles del proyecto.
              </p>              
            </div>
          </details>

          <details class="faq-item group">
            <summary class="faq-summary">
              <span class="font-semibold" i18n="@@info.tech.methodology.title">Metodología: definición y supervisión</span>
              <span class="material-symbols-outlined transition-transform duration-300 group-open:rotate-180">expand_more</span>
            </summary>
            <div class="faq-content">
              <p i18n="@@info.tech.methodology.content">
                El éxito depende de dos pilares: una <strong>definición clara de especificaciones</strong> y una rigurosa <strong>supervisión humana</strong>. Nuestro rol se centra en validar cada entrega de la IA, corrigiendo desviaciones y asegurando que el producto final cumpla con los estándares de calidad más exigentes.
              </p>
            </div>
          </details>

          <details class="faq-item group">
            <summary class="faq-summary">
              <span class="font-semibold" i18n="@@info.tech.process.title">One Shot: de prototipo a producción</span>
              <span class="material-symbols-outlined transition-transform duration-300 group-open:rotate-180">expand_more</span>
            </summary>
            <div class="faq-content">
              <p i18n="@@info.tech.process.content">
                El desarrollo evolucionó desde un prototipo <em>One Shot</em> en HTML/JS hasta una arquitectura profesional en <strong>Angular 21</strong>. La conversión no fue automática; requirió un trabajo de <strong>refinamiento y supervisión</strong> humana para guiar a la IA, asegurando que la adaptación cumpliera estrictamente con las mejores prácticas y patrones del framework.
              </p>
            </div>
          </details>

          <details class="faq-item group">
            <summary class="faq-summary">
              <span class="font-semibold" i18n="@@info.tech.context.title">El reto del conocimiento: contexto vs. entrenamiento</span>
              <span class="material-symbols-outlined transition-transform duration-300 group-open:rotate-180">expand_more</span>
            </summary>
            <div class="faq-content">
              <p i18n="@@info.tech.context.content">
                Los modelos de IA dependen de sus datos de entrenamiento, que a menudo contienen información desactualizada. Esto puede llevar al uso de pautas obsoletas o "deprecadas". Para evitarlo, es fundamental <strong>inyectar el contexto de la documentación técnica más reciente</strong>, "re-educando" al modelo en tiempo real para que ignore viejos hábitos y aplique las últimas novedades tecnológicas.
              </p>
            </div>
          </details>
          <details class="faq-item group">
            <summary class="faq-summary">
              <span class="font-semibold" i18n="@@info.tech.security.title">Privacidad: tus datos no salen de aquí</span>
              <span class="material-symbols-outlined transition-transform duration-300 group-open:rotate-180">expand_more</span>
            </summary>
            <div class="faq-content">
              <p i18n="@@info.tech.security.content">
                Esta aplicación funciona <strong>100% en local</strong> dentro de tu navegador. Ningún dato fiscal, nombre o cifra se envía a servidores externos. Los cálculos se realizan en tu dispositivo y la información solo se guarda si decides usar la función de "Historial" (usando el almacenamiento local de tu navegador).
              </p>
            </div>
          </details>

          <details class="faq-item group">
            <summary class="faq-summary">
              <span class="font-semibold" i18n="@@info.tech.stack.title">Stack tecnológico: Angular 21 y más</span>
              <span class="material-symbols-outlined transition-transform duration-300 group-open:rotate-180">expand_more</span>
            </summary>
            <div class="faq-content">
              <p class="mb-2" i18n="@@info.tech.stack.intro">
                Arquitectura moderna diseñada para rendimiento y mantenibilidad:
              </p>
              <ul class="list-disc pl-5 space-y-1">
                <li i18n="@@info.tech.stack.list.core"><strong>Angular 21</strong>: Standalone Components, Signals y Control Flow (&#64;if/&#64;for).</li>
                <li i18n="@@info.tech.stack.list.css"><strong>Tailwind CSS 4</strong>: Estilado atómico con el nuevo motor Oxide de alto rendimiento.</li>
                <li i18n="@@info.tech.stack.list.state"><strong>Signals</strong>: Gestión de estado reactiva y granular sin Zone.js.</li>
                <li i18n="@@info.tech.stack.list.pwa"><strong>Client-Side</strong>: Ejecución pura en JavaScript/TypeScript sin backend.</li>
              </ul>
            </div>
          </details>
        </div>
      </div>
    </div>
  `,
  styles: `
    @reference "tailwindcss";

    .gradient-text {
      background: linear-gradient(135deg, #6366f1 0%, #06b6d4 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .hero-subtitle {
      @apply max-w-2xl mx-auto;
      color: var(--color-text-secondary);
    }

    .glass-card-section {
      @apply p-6 rounded-2xl;
      background: var(--glass-bg);
      border: 1px solid var(--glass-border);
      box-shadow: var(--glass-shadow);
    }

    .section-header {
      @apply flex items-center gap-3 mb-5 pb-4;
      border-bottom: 1px solid var(--glass-border);
    }

    .faq-item {
      @apply rounded-xl overflow-hidden;
      background: var(--glass-bg);
      border: 1px solid var(--glass-border);
    }

    .faq-summary {
      @apply flex justify-between items-center p-4 cursor-pointer transition-colors duration-200 list-none select-none;
      color: var(--color-text-primary);
    }
    .faq-summary:hover {
      background: var(--table-row-hover);
    }

    .faq-content {
      @apply p-4 text-sm leading-relaxed;
      color: var(--color-text-secondary);
      border-top: 1px solid var(--glass-border);
      background: var(--table-row-alt);
    }

    .cta-button {
      @apply w-full py-5 rounded-2xl font-bold text-white flex items-center justify-center gap-3 transition-all duration-300 cursor-pointer;
      background: linear-gradient(135deg, #6366f1 0%, #06b6d4 100%);
      box-shadow: 0 8px 30px rgba(99, 102, 241, 0.3);
    }
    .cta-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 12px 40px rgba(99, 102, 241, 0.4);
    }
    .cta-button:active {
      transform: translateY(0);
    }
  `
})
export class InfoViewComponent {
  start = output<void>();
}
