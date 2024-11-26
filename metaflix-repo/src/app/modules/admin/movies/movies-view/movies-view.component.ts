import {
    ChangeDetectionStrategy,
    Component,
    computed,
    inject,
    signal,
} from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import {
    MatOption,
    MatSelect,
    MatSelectChange,
} from '@angular/material/select';
import { Router, RouterLink } from '@angular/router';
import { MoviesApiService } from 'app/api/movies/movies-api.service';
import { Status, role } from 'app/mock-api/movies/data';
import {
    TableEventEmitter,
    TableFilters,
    TablePaginationOptions,
} from 'core/components/base-table/base-table.type';
import { HeaderComponent } from 'core/components/header/header.component';
import { MoviesDataSource } from 'core/models/movie.model';
import { MoviesTableComponent } from './movies-table/movies-table.component';

@Component({
    selector: 'app-movies-view',
    standalone: true,
    imports: [
        MatIconModule,
        MatButtonModule,
        RouterLink,
        MoviesTableComponent,
        HeaderComponent,
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule, // Add MatFormFieldModule
        MatInputModule,
        MatSelect,
        MatOption,
    ],
    templateUrl: './movies-view.component.html',
    styleUrl: './movies-view.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MoviesViewComponent {
    role = signal(role);
    status = signal(Status);
    private router = inject(Router);
    private api = inject(MoviesApiService);
    private movies = inject(MoviesApiService).movies;
    displayedFieldsInTable = computed(
        () =>
            this.movies().map((user) => ({
                id: user?.id,
                name: user?.name,
                email: user?.email,
                status: user?.status,
                role: user?.role,
            })) as MoviesDataSource[]
    );

    paginatorOptions = computed<TablePaginationOptions>(() => ({
        pageSize: this.api.moviesPaginationOptions().pageSize,
        total: this.api.moviesPaginationOptions().total,
        pageSizeOptions: [this.api.moviesPaginationOptions().pageSize],
    }));
    getDateForByRole(event: MatSelectChange) {
        const name = event.value;

        this.movies.set(
            this.movies().filter((value) => {
                value.role = name;
            })
        );
    }
    getDateForByStatus(event: MatSelectChange) {
        const name = event.value;
        console.log(name);
        this.movies.update((files) => {
            const updatedFiles = files.filter((file) => file.status == name);
            console.log('Updated files:', updatedFiles);
            return updatedFiles;
        });
    }

    viewMovieDetails(clicked_movie: MoviesDataSource) {
        this.router.navigate(['/movies/details', clicked_movie['id']]);
    }

    filterMovies(data: TableFilters<MoviesDataSource>) {
        this.api
            .getMovies(data.activePage + 1, data.query, data.sort)
            .subscribe({
                next({ meta }) {
                    if (meta.sort && meta.sort.active) {
                        data.sort.active = meta.sort.active;
                        data.sort.direction = meta.sort.direction;
                    }
                    data.source.paginator &&
                        (data.source.paginator.length = meta.total);
                },
            });
    }

    deleteMovie($event: TableEventEmitter<MoviesDataSource, MoviesDataSource>) {
        this.api.deleteMovie($event.data.id).subscribe({
            next: () => {
                $event.source.data = $event.source.data.filter(
                    (m) => m.id !== $event.data.id
                );
                $event.selection.setSelection(
                    ...$event.selection.selected.filter(
                        (s) => s.id !== $event.data.id
                    )
                );
                this.router.navigate(['/movies']);
            },
        });
    }

    editMovie($event: TableEventEmitter<MoviesDataSource, MoviesDataSource>) {
        this.router.navigate(['/movies/edit', $event.data.id]);
    }

    deleteMultipleMovies(
        $event: TableEventEmitter<MoviesDataSource[], MoviesDataSource>
    ) {
        $event.data.forEach((movie) =>
            this.deleteMovie({
                data: movie,
                source: $event.source,
                selection: $event.selection,
            })
        );
    }
}
