import {
    ChangeDetectionStrategy,
    Component,
    Inject,
    inject,
    signal,
    viewChild,
} from '@angular/core';
import { MatDrawer } from '@angular/material/sidenav';
import { ActivatedRoute, Router } from '@angular/router';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { takeUntil } from 'rxjs';
import { UnsubscribeAll } from './unsubscribe';
@Component({
    selector: 'app-drawer-content',
    standalone: true,
    template: '',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DrawerContainer extends UnsubscribeAll {
    /**
     * Injections
     */
    _activatedRoute = inject(ActivatedRoute);
    _router = inject(Router);
    _fuseMediaWatcherService = inject(FuseMediaWatcherService);

    private currentPath =
        this._activatedRoute.firstChild?.snapshot.routeConfig.path.split(
            '/'
        )[0];

    /**
     * Signals
     */
    drawerMode = signal<'over' | 'side'>('side');
    drawerOpened = signal(false);
    matDrawer = viewChild<MatDrawer>('matDrawer');

    /**
     * Constructor
     * @param backDropPath where to navigate when backdrop is clicked (default: './')
     */
    constructor(@Inject(String) public backDropPath: string = './') {
        super();
    }

    /**
     * On init
     */
    ngOnInit(): void {
        // Subscribe to media changes
        this._fuseMediaWatcherService.onMediaChange$
            .pipe(takeUntil(this._destroyed$))
            .subscribe(({ matchingAliases }) => {
                // Set the drawerMode and drawerOpened
                if (matchingAliases.includes('xl')) {
                    this.drawerMode.set('side');
                    this._router.routerState.snapshot.url.includes(
                        this.currentPath
                    ) && this.drawerOpened.set(true);
                } else {
                    this.drawerMode.set('over');
                }
            });
    }

    /**
     * On backdrop clicked
     */
    onBackdropClicked(): void {
        // Go back to the list
        this._router.navigate([this.backDropPath], {
            relativeTo: this._activatedRoute,
        });
    }
}
