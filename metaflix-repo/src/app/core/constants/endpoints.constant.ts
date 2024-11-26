import { environment } from 'environments/environment';

const API_URL = environment.api_url;
export const auth_api_endpoints = {
    login: `${API_URL.replace('v1/', '')}login`,
    logout: `${API_URL.replace('v1/', '')}logout`,
};
export const movies_api_endpoints = {
    get: `${API_URL}movies`,
    find: `${API_URL}movies/find`,
    delete: `${API_URL}movies/delete`,
    edit: `${API_URL}movies/edit`,
    getDirectors: `${API_URL}directors`,
    getCastMembers: `${API_URL}casts`,
    getDomains: `${API_URL}domains`,
    getGenres: `${API_URL}genres`,
    getLanguages: `${API_URL}languages`,
} as const;
