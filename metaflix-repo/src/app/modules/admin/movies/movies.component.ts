import { Component, ViewEncapsulation, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { RouterLink, RouterOutlet } from '@angular/router';
import { MoviesApiService } from 'app/api/movies/movies-api.service';
import { HeaderComponent } from 'core/components/header/header.component';
import { DrawerContainer } from 'core/shared/drawer.container';
import { MovieDetailsComponent } from './movie-details/movie-details.component';
import { MoviesViewComponent } from './movies-view/movies-view.component';

@Component({
    selector: 'app-movies',
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [
        MatSidenavModule,
        RouterLink,
        RouterOutlet,
        MoviesViewComponent,
        MovieDetailsComponent,
        HeaderComponent,
        MatIconModule,
        MatButtonModule,
    ],
    templateUrl: './movies.component.html',
    styleUrl: './movies.component.scss',
})
export class MoviesComponent extends DrawerContainer {
    /**
     * Injections
     */
    _moviesApiService = inject(MoviesApiService);

    /**
     * Signals
     */
    breadcrumbs = signal(['movies', 'overview']);

    /**
     * Constructor
     */
    constructor() {
        super('./');
    }

    createNewMovie() {
        this._router.navigate(['create'], { relativeTo: this._activatedRoute });
    }

    updateBreadcrumbs(movieName: string) {
        this.breadcrumbs.set(['movies', 'overview', movieName]);
    }
}
