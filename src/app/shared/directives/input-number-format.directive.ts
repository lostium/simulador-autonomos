import { Directive, ElementRef, HostListener, inject, OnInit, OnDestroy } from '@angular/core';
import { NgControl } from '@angular/forms';
import { Subscription } from 'rxjs';

@Directive({
  selector: '[appInputNumberFormat]',
  standalone: true
})
export class InputNumberFormatDirective implements OnInit, OnDestroy {
  private el = inject(ElementRef<HTMLInputElement>);
  private ngControl = inject(NgControl);
  private sub?: Subscription;

  ngOnInit() {
    // Escuchar cambios programáticos (ej: carga desde store)
    this.sub = this.ngControl.valueChanges?.subscribe((val) => {
      // Solo formatear si el input NO tiene el foco para no molestar al usuario mientras escribe
      if (document.activeElement !== this.el.nativeElement) {
        this.formatValue(val);
      }
    });
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  @HostListener('focus')
  onFocus() {
    // Al recibir foco, mostrar el valor numérico sin formato para editar
    const val = this.parseValue(this.el.nativeElement.value);
    this.el.nativeElement.value = val === 0 ? '' : val.toString();
    this.el.nativeElement.select(); // Opcional: seleccionar todo al hacer clic
  }

  @HostListener('blur')
  onBlur() {
    const inputVal = this.el.nativeElement.value;
    const numValue = this.parseValue(inputVal);

    // 1. Actualizar el modelo (FormControl) con el número real
    this.ngControl.control?.setValue(numValue, { emitEvent: true });

    // 2. Formatear la vista (Input) con puntos de miles
    // Usamos setTimeout para asegurar que esto ocurra después de que Angular
    // haya propagado el cambio del modelo a la vista (que escribiría el número sin formato)
    setTimeout(() => {
        this.formatValue(numValue);
    });
  }

  private formatValue(val: number | string | null) {
    if (val === null || val === '' || val === undefined) {
      this.el.nativeElement.value = '';
      return;
    }
    
    const num = typeof val === 'string' ? this.parseValue(val) : val;
    if (num === 0 && this.el.nativeElement.value === '') return; 

    this.el.nativeElement.value = new Intl.NumberFormat('es-ES', { 
      maximumFractionDigits: 0,
      useGrouping: true 
    }).format(num);
  }

  private parseValue(val: string): number {
    if (!val) return 0;
    // Eliminar puntos y reemplazar coma por punto decimal si hubiera
    const clean = val.replace(/\./g, '').replace(',', '.');
    return parseFloat(clean) || 0;
  }
}
