/* eslint-disable */

import { Movie } from 'core/models/movie.model';

export const movies: Movie[] = [
    {
        id: 19,
        name: 'mazen ',
        role: 'admin',
        status: 'Active',
        email: 'mazen@gmail.com',
    },
];

export const Status = [{ name: 'Active' }, { name: 'Inactive' }];
export const role = [{ name: 'Admin' }, { name: 'User' }, { name: 'Guest' }];
