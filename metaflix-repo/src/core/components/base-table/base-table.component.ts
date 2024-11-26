import { SelectionModel } from '@angular/cdk/collections';
import {
    AfterViewInit,
    Component,
    computed,
    inject,
    input,
    output,
    viewChild,
} from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import {
    BehaviorSubject,
    debounceTime,
    distinctUntilChanged,
    merge,
} from 'rxjs';
import {
    TableEventEmitter,
    TableFilters,
    TablePaginationOptions,
} from './base-table.type';

@Component({
    standalone: true,
    imports: [],
    template: ``,
})
export abstract class BaseTableComponent<
    T extends Record<string, any> & { id: string | number },
> implements AfterViewInit
{
    // -------------------------------------------------------------------------------------
    // @ Services
    // -------------------------------------------------------------------------------------
    private _fuseConfirmationService = inject(FuseConfirmationService);

    // -------------------------------------------------------------------------------------
    // @ Inputs and Outputs
    // -------------------------------------------------------------------------------------
    protected readonly data = input.required<T[]>();
    /**
     * @emits ObjectData when a row is clicked
     */
    protected readonly rowClicked = output<T>();
    protected readonly editBtnClicked = output<TableEventEmitter<T, T>>();
    protected readonly deleteBtnClicked = output<TableEventEmitter<T, T>>();
    protected readonly deleteMultipleBtnClicked =
        output<TableEventEmitter<T[], T>>();
    /**
     * @emits `TableFilters` when sort, paginator or filter changes
     * @description can be used to fetch data from the server or update the data in the table based on the filters
     */
    protected readonly filtersChanged = output<TableFilters<T>>();
    protected readonly tableTitle = input.required<string>();
    protected readonly tableSubtitle = input.required<string>();
    protected readonly paginatorOptions = input<TablePaginationOptions>({
        pageSize: 10,
        pageSizeOptions: [5, 10, 25, 100],
        total: 0,
    });

    // -------------------------------------------------------------------------------------
    // @ Properties
    // -------------------------------------------------------------------------------------

    /**
     * ViewChildren
     */
    protected readonly matTable = viewChild<MatTable<T>>(MatTable);
    protected readonly paginator = viewChild<MatPaginator>(MatPaginator);
    protected readonly sort = viewChild<MatSort>(MatSort);

    /**
     * Observables and Subjects
     */
    private readonly _filterChanges$ = new BehaviorSubject<string>('');
    private readonly filterChanges = this._filterChanges$
        .asObservable()
        .pipe(debounceTime(300), distinctUntilChanged());

    /**
     * Signals
     */
    protected readonly dataSource = computed(
        () => new MatTableDataSource<T>(this.data())
    );
    protected readonly displayedColumns = computed<(keyof T)[]>(() =>
        this.data() && this.data()?.length > 0
            ? ([...Object.keys(this.data()[0])] as (keyof T)[])
            : []
    );
    protected readonly allDisplayedColumns = computed(() => [
        'select',
        ...this.displayedColumns(),
        'actions',
    ]);

    /**
     * Properties
     */
    protected readonly selection = new SelectionModel(true, []);
    protected readonly rowCellClass =
        'transition-colors group-hover:bg-stone-100  group-hover:text-black ';

    /**
     * Getters
     */
    get isAllSelected() {
        const numSelected = this.selection.selected.length;
        const numRows = this.dataSource().data.length;
        return numSelected === numRows;
    }

    // -------------------------------------------------------------------------------------
    // @ Lifecycle Hooks
    // -------------------------------------------------------------------------------------

    ngAfterViewInit() {
        this.dataSource().paginator = this.paginator();
        this.dataSource().sort = this.sort();
        merge(
            this.sort().sortChange,
            this.paginator().page,
            this.filterChanges
        ).subscribe(() => {
            this.filtersChanged.emit({
                activePage: this.paginator().pageIndex,
                pageSize: this.paginator().pageSize,
                query: this._filterChanges$.value,
                sort: this.sort(),
                source: this.dataSource(),
            });
        });

        // this.filterChanges.subscribe((value) => {
        //     this.dataSource().filter = value.trim().toLowerCase();
        // });
    }

    // -------------------------------------------------------------------------------------
    // @ Public Methods
    // -------------------------------------------------------------------------------------

    protected toggleAllRows() {
        if (this.isAllSelected) {
            this.selection.clear();
            return;
        }

        this.selection.select(...this.dataSource().data);
    }

    protected checkboxLabel(row?): string {
        if (!row) {
            return `${this.isAllSelected ? 'deselect' : 'select'} all`;
        }
        return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`;
    }

    protected applyFilter(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this._filterChanges$.next(filterValue.trim().toLowerCase());
        if (this.dataSource().paginator) {
            this.dataSource().paginator.firstPage();
        }
    }

    protected clickRow(row) {
        this.rowClicked.emit(row);
    }

    protected trackBy(index: number, item: T) {
        return item.id || index;
    }

    /**
     * Delete the row
     */
    protected deleteRow(event: TableEventEmitter<T, T>): void {
        // Open the confirmation dialog
        const confirmation = this._fuseConfirmationService.open({
            title: 'Delete task',
            message:
                'Are you sure you want to delete this task? This action cannot be undone!',
            actions: {
                confirm: {
                    label: 'Delete',
                },
            },
        });

        // Subscribe to the confirmation dialog closed action
        confirmation.afterClosed().subscribe((result) => {
            // If the confirm button pressed...
            if (result === 'confirmed') {
                this.paginator().length -= 1;
                // Get the current task's id
                this.deleteBtnClicked.emit({
                    ...event,
                });
            }
        });
    }
    /**
     * Delete multiple rows
     */
    protected deleteRows(event: TableEventEmitter<T[], T>): void {
        // Open the confirmation dialog
        const confirmation = this._fuseConfirmationService.open();

        // Subscribe to the confirmation dialog closed action
        confirmation.afterClosed().subscribe((result) => {
            this.paginator().length -= event.data.length;

            // If the confirm button pressed...
            if (result === 'confirmed') {
                // Get the current task's id
                this.deleteMultipleBtnClicked.emit({
                    ...event,
                });
            }
        });
    }
}
