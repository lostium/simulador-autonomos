import { Injectable, inject } from '@angular/core';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { filter, map } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class PwaUpdateService {
    private swUpdate = inject(SwUpdate);

    public updateAvailable$: Observable<boolean> = this.swUpdate.isEnabled
        ? this.swUpdate.versionUpdates.pipe(
            filter((evt): evt is VersionReadyEvent => evt.type === 'VERSION_READY'),
            map(() => true)
        )
        : of(false);

    public activateUpdate(): void {
        if (this.swUpdate.isEnabled) {
            this.swUpdate.activateUpdate().then(() => document.location.reload());
        }
    }
}
