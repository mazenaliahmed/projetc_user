import { SelectionModel } from '@angular/cdk/collections';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

export type TableFilters<T> = {
    activePage: number;
    pageSize: number;
    query: string;
    sort: MatSort;
    source?: MatTableDataSource<T>;
};

export type TableEventEmitter<T, K> = {
    data: T;
    source?: MatTableDataSource<K>;
    selection?: SelectionModel<K>;
};

export type TablePaginationOptions = {
    pageSize: MatPaginator['pageSize'];
    pageSizeOptions: MatPaginator['pageSizeOptions'];
    total: MatPaginator['length'];
};
