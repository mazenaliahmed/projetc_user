import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatDrawerToggleResult } from '@angular/material/sidenav';
import { Observable, of } from 'rxjs';
import { DrawerContainer } from './drawer.container';
@Component({
    selector: 'app-drawer-content',
    standalone: true,
    template: '',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DrawerContent {
    /**
     * @param drawerParentComponent This is the parent component that extends DrawerContainer
     * @description we are injecting this component to have access to the matDrawer
     */
    constructor(public drawerParentComponent: DrawerContainer) {}

    /**
     * On init open the drawer
     */
    ngOnInit(): void {
        this.drawerParentComponent.matDrawer().open();
    }

    /**
     * Close the drawer
     * @returns Promise<MatDrawerToggleResult>
     * @description Close the drawer and return the result
     */
    closeDrawer(): Promise<MatDrawerToggleResult> {
        return this.drawerParentComponent.matDrawer().close();
    }

    /**
     * Can deactivate function to check if the drawer can be closed
     * @usage This function is used in the canDeactivate guard
     * @returns Observable<boolean>
     */
    canDeactivateFn(): Observable<boolean> {
        return of(true);
    }
}
