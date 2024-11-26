import { Injectable, inject } from '@angular/core';
import { FuseMockApiService } from '@fuse/lib/mock-api';
import { MoviesApiService } from 'app/api/movies/movies-api.service';
import { movies_api_endpoints } from 'app/core/constants/endpoints.constant';
import {
    Movie,
    MoviesDataSource,
    PaginatedData,
} from 'core/models/movie.model';
import { cloneDeep } from 'lodash-es';
import { movies } from './data';

@Injectable({ providedIn: 'root' })
export class MoviesMockApi {
    private readonly _movies: Movie[] = movies;
    private movies = inject(MoviesApiService).movies;
    /**
     * Constructor
     */
    constructor(private _fuseMockApiService: FuseMockApiService) {
        this.registerHandlers();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Register Mock API handlers
     */
    registerHandlers(): void {
        // -----------------------------------------------------------------------------------------------------
        // @ Movies - GET All - Pagination
        // -----------------------------------------------------------------------------------------------------
        this._fuseMockApiService
            .onGet('api/apps/users/all', 1200)
            .reply(({ request }) => {
                // Request Data

                const page: number = +request.params.get('page') || 1;
                const search = request.params.get('search');
                const orderby = request.params.get('orderby');
                const direction = request.params.get('direction');

                // Prepare the data for pagination and sorting

                // Clone the movies
                const moviesPerPage = 10;
                const moviesFilteredBySearchQuery =
                    cloneDeep(this._movies).filter((movie) => {
                        return movie.name
                            .toLowerCase()
                            .includes(search.toLowerCase());
                    }) || [];

                // if search query is present, return the result from the beginning
                // else return the result starting from the current page
                const sliceData = !!search
                    ? { start: 0, end: moviesPerPage }
                    : {
                          start: (page - 1) * moviesPerPage,
                          end: page * moviesPerPage,
                      };

                // sort and paginate the data
                const query = moviesFilteredBySearchQuery
                    .slice(sliceData.start, sliceData.end)
                    .sort((a, b) => {
                        if (orderby) {
                            if (a[orderby] < b[orderby]) {
                                return direction === 'asc' ? -1 : 1;
                            }
                            if (a[orderby] > b[orderby]) {
                                return direction === 'asc' ? 1 : -1;
                            }
                        }
                        return 0;
                    });

                const movies: PaginatedData<MoviesDataSource> = {
                    data: query,
                    meta: {
                        total: moviesFilteredBySearchQuery.length,
                        current_page: page,
                        pageSize: moviesPerPage,
                        sort: {
                            active: orderby as keyof MoviesDataSource,
                            direction: direction as 'asc' | 'desc',
                        },
                    },
                };
                console.log('movies1221');
                console.log(movies);
                return [200, movies];
            });

        // -------------------------------------------------------------------------------------
        // @ Movie - GET
        // -------------------------------------------------------------------------------------
        this._fuseMockApiService
            .onGet(movies_api_endpoints.find)
            .reply(({ request }) => {
                // Get the id from the request
                const id = request.params.get('id');

                // Find the movie
                const movie = this._movies.find((item) => item.id === +id);

                // Return the response
                return [200, movie];
            });

        // -------------------------------------------------------------------------------------
        // @ Movie - POST
        // -------------------------------------------------------------------------------------
        this._fuseMockApiService
            .onPost('api/apps/users/create')
            .reply(({ request }) => {
                // Get the movie from the request
                let movie = request.body.movie;
                movie.id = Math.floor(Math.random() * 1000);
                let newAsset = {
                    ...movie,
                };

                console.log('newAsset');
                console.log(newAsset);
                this._movies.push(newAsset);

                console.log('this._assets');
                console.log(this._movies);

                this.movies.set(this._movies);

                // Return the response
                return [200, newAsset];
            });

        this._fuseMockApiService
            .onPatch('api/apps/asset/asset')
            .reply(({ request }) => {
                const editedMovie = request.body.editedAsset;
                const id = request.body.id;

                console.log(editedMovie);

                // Update the asset in the mock assets array
                this._movies.forEach((asset, index) => {
                    if (asset.id === +id) {
                        this._movies[index] = editedMovie;
                    }
                });

                return [200, editedMovie]; // Ensure this matches the expected return structure
            });

        this._fuseMockApiService
            .onGet('api/apps/asset/byid')
            .reply(({ request }) => {
                const id = request.params.get('id');
                const asset = this._movies.find((item) => item.id === +id);
                console.log('asset in api');
                console.log(asset);
                return [200, asset];
            });

        // -----------------------------------------------------------------------------------------------------
        // @ Movie - DELETE
        // -----------------------------------------------------------------------------------------------------
        this._fuseMockApiService
            .onDelete(movies_api_endpoints.delete)
            .reply(({ request }) => {
                // Get the id
                const id = request.params.get('id');

                // Find the product and delete it
                this._movies.forEach((movie, index) => {
                    if (movie.id === +id) {
                        this._movies.splice(index, 1);
                    }
                });

                // Return the response
                return [200, true];
            });
        // -------------------------------------------------------------------------------------
        // @ Movie - PATCH - Edit
        // -------------------------------------------------------------------------------------
        this._fuseMockApiService
            .onPatch(movies_api_endpoints.edit)
            .reply(({ request }) => {
                // Get the id from the request
                const id = request.params.get('id');

                // Get the movie from the request
                const editedMovie = request.body;

                // Find the movie and update it
                this._movies.forEach((movie, index) => {
                    if (movie.id === +id) {
                        this._movies[index] = editedMovie;
                    }
                });

                // Return the response
                return [200, editedMovie];
            });

        // -------------------------------------------------------------------------------------
        // @ Directors - GET
        // -------------------------------------------------------------------------------------
        // this._fuseMockApiService
        //     .onGet(movies_api_endpoints.getDirectors, 1200)
        //     .reply(() => {
        //         // const directors = this._movies[0].directors;
        //         return [200, this._directors];
        //     });
        // -------------------------------------------------------------------------------------
        // @ Cast Members - GET
        // -------------------------------------------------------------------------------------
        // this._fuseMockApiService
        //     .onGet(movies_api_endpoints.getCastMembers, 1200)
        //     .reply(() => {
        //         return [200, this._castMembers];
        //     });
        // -------------------------------------------------------------------------------------
        // @ Domains - GET
        // -------------------------------------------------------------------------------------
        // this._fuseMockApiService
        //     .onGet(movies_api_endpoints.getDomains, 1200)
        //     .reply(() => {
        //         return [200, this._domains];
        //     });
        // -------------------------------------------------------------------------------------
        // @ Genres - GET
        // -------------------------------------------------------------------------------------
        // this._fuseMockApiService
        //     .onGet(movies_api_endpoints.getGenres, 1200)
        //     .reply(() => {
        //         return [200, this._genres];
        //     });
        // -------------------------------------------------------------------------------------
        // @ Languages - GET
        // -------------------------------------------------------------------------------------
        // this._fuseMockApiService
        //     .onGet(movies_api_endpoints.getLanguages, 1200)
        //     .reply(() => {
        //         return [200, this._languages];
        //     });
    }
}
