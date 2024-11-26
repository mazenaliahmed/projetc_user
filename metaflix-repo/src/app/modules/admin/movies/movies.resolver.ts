import { inject } from '@angular/core';
import {
    ActivatedRouteSnapshot,
    ResolveFn,
    RouterStateSnapshot,
} from '@angular/router';
import { MoviesApiService } from 'app/api/movies/movies-api.service';
import { Movie } from 'core/models/movie.model';

export const resolveMovie: ResolveFn<Movie> = (
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
) => {
    const movieId = route.params.id;

    // call the api to get the movie details
    return inject(MoviesApiService).getMovie(movieId);
};
