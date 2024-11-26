import { inject } from '@angular/core';
import {
    ActivatedRouteSnapshot,
    RouterStateSnapshot,
    Routes,
} from '@angular/router';
import { MoviesApiService } from 'app/api/movies/movies-api.service';
import { DrawerContent } from 'core/shared/drawer.content';
import { map } from 'rxjs';
import { CreateMovieComponent } from './create-movie/create-movie.component';
import { MovieDetailsComponent } from './movie-details/movie-details.component';
import { resolveMovie } from './movies.resolver';

// -------------------------------------------------------------------------------------
// @ CanDeactivate guards
// -------------------------------------------------------------------------------------
const closeDrawer = <T extends DrawerContent>(
    component: T,
    nextState: RouterStateSnapshot,
    path: string
) => {
    // Get the next route
    let nextRoute: ActivatedRouteSnapshot = nextState.root;

    return component.canDeactivateFn().pipe(
        map((canDeactivate) => {
            if (canDeactivate) {
                while (nextRoute.firstChild) {
                    nextRoute = nextRoute.firstChild;
                }

                // If the next state doesn't contain '/movies'
                // it means we are navigating away from the
                // movies app
                if (!nextState.url.includes('/movies')) {
                    // Let it navigate
                    return true;
                }
                if (nextState.url.includes(path)) {
                    // Let it navigate
                    return true;
                }

                // Otherwise, close the drawer first, and then navigate
                return component.closeDrawer().then(() => {
                    return true;
                });
            } else {
                return false;
            }
        })
    );
};

const canDeactivateMovieDetails = (
    component: MovieDetailsComponent,
    currentRoute: ActivatedRouteSnapshot,
    currentState: RouterStateSnapshot,
    nextState: RouterStateSnapshot
) => closeDrawer(component, nextState, '/details');
const canDeactivateMovieCreateForm = (
    component: CreateMovieComponent,
    currentRoute: ActivatedRouteSnapshot,
    currentState: RouterStateSnapshot,
    nextState: RouterStateSnapshot
) => closeDrawer(component, nextState, '/create');

const canDeactivateMovieEditForm = (
    component: CreateMovieComponent,
    currentRoute: ActivatedRouteSnapshot,
    currentState: RouterStateSnapshot,
    nextState: RouterStateSnapshot
) => closeDrawer(component, nextState, '/edit');

// -------------------------------------------------------------------------------------
// @ Routes
// -------------------------------------------------------------------------------------
export default [
    {
        path: '',
        loadComponent: () =>
            import('./movies.component').then((m) => m.MoviesComponent),
        resolve: {
            movies: () => inject(MoviesApiService).getMovies(),
        },
        children: [
            {
                path: 'create',
                loadComponent: () =>
                    import('./create-movie/create-movie.component').then(
                        (m) => m.CreateMovieComponent
                    ),
                canDeactivate: [canDeactivateMovieCreateForm],
                resolve: {},
            },
            {
                path: 'edit/:id',
                loadComponent: () =>
                    import('./edit-movie/edit-movie.component').then(
                        (m) => m.EditMovieComponent
                    ),
                resolve: {
                    movie: resolveMovie,
                },
                canDeactivate: [canDeactivateMovieEditForm],
            },
            {
                path: 'details/:id',
                loadComponent: () =>
                    import('./movie-details/movie-details.component').then(
                        (m) => m.MovieDetailsComponent
                    ),
                resolve: {
                    movie: resolveMovie,
                },
                canDeactivate: [canDeactivateMovieDetails],
            },
        ],
    },
] as Routes;
