import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Dialog } from '@angular/cdk/dialog';
import { Subject, takeUntil, filter } from 'rxjs';
import { HeaderComponent } from './shared/components/header/header';
import { DisclaimerBannerComponent } from './shared/components/disclaimer-banner/disclaimer-banner';
import { FooterComponent } from './shared/components/footer/footer';
import { PwaUpdateService } from './core/services/pwa-update.service';
import { ConfirmDialogComponent, ConfirmDialogData } from './shared/components/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, DisclaimerBannerComponent, FooterComponent],
  template: `
    <div class="min-h-screen bg-mesh text-slate-100">
      <app-header />
      <app-disclaimer-banner />
      <main>
        <router-outlet />
      </main>
      <app-footer />
    </div>
  `,
  styles: [],
})
export class App implements OnInit, OnDestroy {
  title = 'simulador-autonomos';
  private pwaUpdateService = inject(PwaUpdateService);
  private dialog = inject(Dialog);
  private destroy$ = new Subject<void>();

  ngOnInit() {
    this.pwaUpdateService.updateAvailable$
      .pipe(
        takeUntil(this.destroy$),
        filter(Boolean)
      )
      .subscribe(() => {
        this.showUpdateModal();
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private showUpdateModal() {
    const dialogRef = this.dialog.open<boolean>(ConfirmDialogComponent, {
      data: {
        title: $localize`:@@pwa.update.title:Actualización disponible`,
        message: $localize`:@@pwa.update.message:Hay una nueva versión de la aplicación disponible. ¿Quieres recargar la página para actualizar?`,
        confirmText: $localize`:@@pwa.update.confirm:Recargar`,
        cancelText: $localize`:@@pwa.update.cancel:Cancelar`
      } as ConfirmDialogData,
      width: '400px',
      disableClose: true, // Force user to choose
    });

    dialogRef.closed.subscribe(result => {
      if (result) {
        this.pwaUpdateService.activateUpdate();
      }
    });
  }
}
