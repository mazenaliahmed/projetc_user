import { Component, inject, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterLink } from '@angular/router';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { MoviesApiService } from 'app/api/movies/movies-api.service';
import { Movie } from 'core/models/movie.model';
import { DrawerContent } from 'core/shared/drawer.content';
import { take } from 'rxjs';
import { MoviesComponent } from '../movies.component';

@Component({
    selector: 'app-movie-details',
    standalone: true,
    imports: [RouterLink, MatIconModule, MatButtonModule],
    templateUrl: './movie-details.component.html',
    styleUrl: './movie-details.component.scss',
})
export class MovieDetailsComponent extends DrawerContent {
    movie = input.required<Movie>();
    router = inject(Router);
    _fuseConfirmationService = inject(FuseConfirmationService);
    api = inject(MoviesApiService);

    constructor(public moviesComponent: MoviesComponent) {
        super(moviesComponent);
    }

    deleteMovie() {
        const confirmation = this._fuseConfirmationService.open();

        confirmation.afterClosed().subscribe((result) => {
            // If the confirm button pressed...
            if (result === 'confirmed') {
                this.api.deleteMovie(this.movie().id).pipe(take(1)).subscribe();
            }
        });
    }
}
