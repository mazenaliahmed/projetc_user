import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { movies_api_endpoints } from 'app/core/constants/endpoints.constant';
import {
    TableFilters,
    TablePaginationOptions,
} from 'core/components/base-table/base-table.type';
import {
    Movie,
    MovieSchema,
    MoviesDataSource,
    PaginatedData,
} from 'core/models/movie.model';
import { environment } from 'environments/environment';
import { Observable, catchError, map, of, take, tap } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class MoviesApiService {
    private _http = inject(HttpClient);
    private _confirmationService = inject(FuseConfirmationService);
    private _headers = new HttpHeaders({
        Accept: 'application/json',
    });
    private router = inject(Router);

    movies = signal<Movie[]>([]);
    moviesPaginationOptions = signal<
        Omit<TablePaginationOptions, 'pageSizeOptions'>
    >({
        pageSize: 5,
        total: 0,
    });

    // -------------------------------------------------------------------------------------
    // @ Fetch Data from API - Used as a cache to avoid multiple API calls
    // -------------------------------------------------------------------------------------

    lastFetchedMovies = signal<Movie[]>([]);

    // -------------------------------------------------------------------------------------
    // @ Movie CRUD Operations - API Calls
    // -------------------------------------------------------------------------------------
    /**
     * Fetches a paginated list of movies from the API.
     *
     * @param {number} [page=1] - The page number to fetch.
     * @param {string} [search=''] - The search query to filter movies.
     * @param {TableFilters<MoviesDataSource>['sort']} [sort] - The sorting options for the movies.
     */
    getMovies(
        page: number = 1,
        search: string = '',
        sort?: TableFilters<MoviesDataSource>['sort']
    ): Observable<PaginatedData<MoviesDataSource> | null> {
        return this._http
            .get<PaginatedData<MoviesDataSource>>('api/apps/users/all', {
                params: {
                    page: page.toString(),
                    search,
                    orderby: sort?.active,
                    direction: sort?.direction,
                },
            })
            .pipe(
                take(1),
                map((movies: PaginatedData<MoviesDataSource>) => {
                    return {
                        ...movies,
                        data: movies.data.map((movie) => {
                            return MovieSchema.parse(movie);
                        }),
                    };
                }),
                tap((movies) => {
                    this.movies.set(movies.data);
                    this.moviesPaginationOptions.set({
                        total: movies.meta.total,
                        pageSize: movies.meta.pageSize,
                    });
                }),
                catchError((error) => {
                    console.error('error', error);
                    return of(null);
                })
            );
    }

    /**
     * Get a movie by id
     */

    getMovie(id: any) {
        const fetchedMovie = this.lastFetchedMovies().find(
            (move) => move.id === +id
        );
        if (!!fetchedMovie) return of(fetchedMovie);

        const requestOptions = { params: { id } };

        // This is necessary because we're using a fake API in development
        // if (environment.production) {
        //     url = url.replace('find', id);
        //     delete requestOptions.params;
        // }

        return this._http
            .get<Movie>('api/apps/asset/byid', requestOptions)
            .pipe(
                take(1),
                tap((move) => {
                    this.lastFetchedMovies.update((currentFetchedAssets) => {
                        if (currentFetchedAssets.length > 0) {
                            const index = currentFetchedAssets.findIndex(
                                (move) => move.id === +id
                            );
                            if (index === -1) {
                                return [...currentFetchedAssets, move];
                            }
                            return currentFetchedAssets;
                        }
                        console.log('asset inner');
                        console.log(move);

                        return [move];
                    });
                }),
                catchError((error) => {
                    console.error('error', error);
                    return of(null);
                })
            );
    }

    /**
     * Create a movie
     * @param movie the new movie object
     * @returns {Observable<{ message: string; movie: Movie }>}
     */
    createMovie(movie: Movie): Observable<{ message: string; movie: Movie }> {
        return this._http
            .post<{
                message: string;
                movie: Movie;
            }>('api/apps/users/create', { movie })
            .pipe(
                take(1),
                tap((response) => {
                    // navigate to the movies list
                    // then update the UI immediately (optimistic update) with the new movie
                    this.router.navigate(['/movies']).then(() => {
                        this.movies.update((movies) => [
                            response.movie,
                            ...movies,
                        ]);

                        // inform the user that the movie has been added
                        this._confirmationService.open({
                            title: 'New Movie Added Successfully',
                            message:
                                'Click anywhere outside this dialog to dismiss.',
                            icon: {
                                show: true,
                                name: 'heroicons_outline:check',
                                color: 'success',
                            },
                            actions: {
                                confirm: {
                                    show: false,
                                    label: 'Remove',
                                    color: 'warn',
                                },
                                cancel: {
                                    show: false,
                                    label: 'Cancel',
                                },
                            },
                            dismissible: true,
                        });
                    });
                })
            );
    }

    /**
     * Edit a movie
     * @param id Edited movie id
     * @param editedMovie Edited movie object
     * @returns {Observable<{ message: string; movie: Movie }>}
     */

    editMovie(
        id: string | number,
        editedAsset: Movie
    ): Observable<{ message: string; asset: Movie }> {
        let url: string = 'api/apps/asset/asset';
        console.log('editedAsset');
        console.log(editedAsset);

        // This is necessary because we're using a fake API in development
        // if (environment.production) {
        //     url = url.replace('edit', `${id}`);
        //     delete requestOptions.params;ي
        // }

        return this._http
            .patch<{
                message: string;
                asset: Movie;
            }>(url, { id, editedAsset })
            .pipe(
                take(1),
                tap((response) => {
                    this.router.navigate(['/movies']).then(() => {
                        this.movies.update((assets) => {
                            const index = assets.findIndex(
                                (asset) => asset.id === id
                            );
                            console.log('response');
                            console.log(response);
                            assets[index] = editedAsset;
                            return [...assets];
                        });
                        this._confirmationService.open({
                            title: `Successfully updated ${editedAsset.name} asset !!`,
                            message:
                                'Click anywhere outside this dialog to dismiss.',
                            icon: {
                                show: true,
                                name: 'heroicons_outline:check',
                                color: 'success',
                            },
                            actions: {
                                confirm: {
                                    show: false,
                                    label: 'Remove',
                                    color: 'warn',
                                },
                                cancel: {
                                    show: false,
                                    label: 'Cancel',
                                },
                            },
                            dismissible: true,
                        });
                    });
                })
            );
    }
    // editMovie(
    //     id: string | number,
    //     editedMovie: Movie
    // ): Observable<{ message: string; movie: Movie }> {
    //     let url: string = movies_api_endpoints.edit;
    //     const requestOptions = { headers: this._headers, params: { id } };

    //     // This is necessary because we're using a fake API in development
    //     if (environment.production) {
    //         url = url.replace('edit', `${id}`);
    //         delete requestOptions.params;
    //     }

    //     return this._http
    //         .put<{
    //             message: string;
    //             movie: Movie;
    //         }>(url, editedMovie, requestOptions)
    //         .pipe(
    //             take(1),
    //             tap((response) => {
    //                 // navigate to the movies list
    //                 // then update the UI immediately (optimistic update) with the new movie
    //                 this.router.navigate(['/movies']).then(() => {
    //                     this.movies.update((movies) => {
    //                         const index = movies.findIndex(
    //                             (movie) => movie.id === id
    //                         );
    //                         movies[index] = response.movie;
    //                         return [...movies];
    //                     });

    //                     // inform the user that the movie has been updated
    //                     this._confirmationService.open({
    //                         title: `Successfully updated ${editedMovie.name} movie !!`,
    //                         message:
    //                             'Click anywhere outside this dialog to dismiss.',
    //                         icon: {
    //                             show: true,
    //                             name: 'heroicons_outline:check',
    //                             color: 'success',
    //                         },
    //                         actions: {
    //                             confirm: {
    //                                 show: false,
    //                                 label: 'Remove',
    //                                 color: 'warn',
    //                             },
    //                             cancel: {
    //                                 show: false,
    //                                 label: 'Cancel',
    //                             },
    //                         },
    //                         dismissible: true,
    //                     });
    //                 });
    //             })
    //         );
    // }

    /**
     * Delete a movie by id
     */
    deleteMovie(id: string | number) {
        let url: string = movies_api_endpoints.delete;
        const requestOptions = { headers: this._headers, params: { id } };

        // This is necessary because we're using a fake API in development
        if (environment.production) {
            url = url.replace('delete', `${id}`);
            delete requestOptions.params;
        }

        return this._http.delete(url, requestOptions).pipe(
            take(1),
            map((isDeleted: boolean) => {
                this.movies.update((movies) =>
                    movies.filter((item) => item.id !== id)
                );

                this.router.navigate(['/movies']).then(() => {
                    // inform the user that the movie has been deleted
                    this._confirmationService.open({
                        title: 'Movie Deleted Successfully!!',
                        message:
                            'Click anywhere outside this dialog to dismiss.',
                        icon: {
                            show: true,
                            name: 'heroicons_outline:check',
                            color: 'success',
                        },
                        actions: {
                            confirm: {
                                show: false,
                                label: 'Remove',
                                color: 'warn',
                            },
                            cancel: {
                                show: false,
                                label: 'Cancel',
                            },
                        },
                        dismissible: true,
                    });
                });
                return isDeleted;
            }),
            catchError((error) => {
                console.error('error', error);
                return [false];
            })
        );
    }
}
