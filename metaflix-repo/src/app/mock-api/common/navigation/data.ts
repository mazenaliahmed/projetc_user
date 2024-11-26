/* eslint-disable */
import { FuseNavigationItem } from '@fuse/components/navigation';

export const defaultNavigation: FuseNavigationItem[] = [
    // {
    //     id: 'overview',
    //     title: 'overview',
    //     type: 'basic',
    //     icon: 'heroicons_outline:chart-pie',
    //     link: '/overview',
    // },
    // {
    //     id: 'users',
    //     title: 'users',
    //     type: 'basic',
    //     icon: 'heroicons_outline:user-group',
    //     link: '/users',
    // },
    {
        id: 'movies',
        title: 'movies',
        type: 'basic',
        icon: 'heroicons_outline:film',
        link: '/movies',
    },
];
export const compactNavigation: FuseNavigationItem[] = [...defaultNavigation];
export const futuristicNavigation: FuseNavigationItem[] = [
    ...defaultNavigation,
];
export const horizontalNavigation: FuseNavigationItem[] = [
    ...defaultNavigation,
];
