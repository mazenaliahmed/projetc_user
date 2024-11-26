import { MatPaginator } from '@angular/material/paginator';
import { z } from 'zod';
export type ColumnNames = 'id' | 'name' | 'email' | 'status' | 'role';

// -------------------------------------------------------------------------------------
// @ Schemas
// -------------------------------------------------------------------------------------
export const MovieSchema = z.object<
    Record<string extends ColumnNames ? string : ColumnNames, any>
>({
    id: z.number(),
    name: z.string(),
    email: z.string(),
    status: z.string(),
    role: z.string(),
});
export type Movie = z.infer<typeof MovieSchema>;

export type MoviesDataSource = Pick<
    Required<Movie>,
    'id' | 'name' | 'email' | 'status' | 'role'
>;

export type PaginatedData<T> = {
    data: Movie[];
    meta: {
        total: MatPaginator['length'];
        pageSize: MatPaginator['pageSize'];
        current_page: MatPaginator['pageIndex'];
        last_page?: number;
        sort: {
            active: keyof T;
            direction: 'asc' | 'desc';
        };
    };
};

export type MovieFormValue = Partial<{
    name: string;
    email: string;
    role: number[];
    status: number[];
}>;
