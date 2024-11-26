import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Subject } from 'rxjs';
@Component({
    standalone: true,
    template: '',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UnsubscribeAll {
    /**
     * Injections
     */
    _destroyed$ = new Subject<boolean>();

    /**
     * On destroy
     */
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._destroyed$.next(true);
        this._destroyed$.complete();
    }
}
