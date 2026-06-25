import { Injectable, inject } from '@angular/core';
import { Overlay, OverlayRef, OverlayConfig } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { ToastComponent } from './toast.component';

export interface Toast {
    id: string;
    message: string;
    type: 'success' | 'error' | 'info';
}

@Injectable({
    providedIn: 'root'
})
export class ToastService {
    private overlay = inject(Overlay);

    private toasts: Toast[] = [];
    private toastComponents: Map<string, { overlayRef: OverlayRef }> = new Map();

    show(message: string, type: 'success' | 'error' | 'info' = 'info', duration = 4000) {
        const id = crypto.randomUUID();
        const toast: Toast = { id, message, type };

        this.toasts.push(toast);
        this.createToastOverlay(toast);

        if (duration > 0) {
            setTimeout(() => this.triggerRemove(id), duration);
        }
    }

    success(message: string, duration = 4000) {
        this.show(message, 'success', duration);
    }

    error(message: string, duration = 4000) {
        this.show(message, 'error', duration);
    }

    info(message: string, duration = 4000) {
        this.show(message, 'info', duration);
    }

    triggerRemove(id: string) {
        const componentData = this.toastComponents.get(id);
        if (componentData) {
            // Trigger the close animation via the component
            const component = (componentData as any).componentRef;
            if (component) {
                component.instance.triggerClose();
            }
        }
    }

    private disposeOverlay(id: string) {
        const componentData = this.toastComponents.get(id);
        if (componentData) {
            componentData.overlayRef.dispose();
            this.toastComponents.delete(id);
        }
        this.toasts = this.toasts.filter(t => t.id !== id);
        this.repositionToasts();
    }

    private createToastOverlay(toast: Toast) {
        const index = this.toasts.findIndex(t => t.id === toast.id);

        const config = new OverlayConfig({
            positionStrategy: this.overlay.position()
                .global()
                .centerHorizontally()
                .bottom(`${24 + (index * 80)}px`),
            hasBackdrop: false,
        });

        const overlayRef = this.overlay.create(config);
        const portal = new ComponentPortal(ToastComponent);
        const componentRef = overlayRef.attach(portal);

        componentRef.instance.toast = toast;
        componentRef.instance.close.subscribe(() => componentRef.instance.triggerClose());
        componentRef.instance.animationDone.subscribe(() => this.disposeOverlay(toast.id));

        this.toastComponents.set(toast.id, { overlayRef, componentRef } as any);
    }

    private repositionToasts() {
        let index = 0;
        for (const [id, data] of this.toastComponents) {
            data.overlayRef.updatePositionStrategy(
                this.overlay.position()
                    .global()
                    .centerHorizontally()
                    .bottom(`${24 + (index * 80)}px`)
            );
            index++;
        }
    }
}
