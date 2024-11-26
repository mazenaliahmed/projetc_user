import { AsyncPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import {
    Component,
    effect,
    inject,
    input,
    signal,
    viewChild,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { FuseAlertType } from '@fuse/components/alert';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { MoviesApiService } from 'app/api/movies/movies-api.service';
import { Movie, MovieFormValue } from 'core/models/movie.model';
import { DrawerContent } from 'core/shared/drawer.content';
import { Observable, map, of } from 'rxjs';
import { MovieFormComponent } from '../_shared/movie-form/movie-form.component';
import { MoviesComponent } from '../movies.component';

@Component({
    selector: 'edit-movie',
    standalone: true,
    imports: [
        MatIconModule,
        RouterLink,
        MovieFormComponent,
        MatButtonModule,
        AsyncPipe,
    ],
    templateUrl: './edit-movie.component.html',
    styleUrl: './edit-movie.component.scss',
})
export class EditMovieComponent extends DrawerContent {
    _api = inject(MoviesApiService);
    _fuseConfirmationDialog = inject(FuseConfirmationService);

    movieFromComponent = viewChild.required<MovieFormComponent>('movieForm');
    movie = input.required<Movie>(); // comes from router input binding

    // -------------------------------------------------------------------------------------
    // @ Fetch Data from API
    // -------------------------------------------------------------------------------------

    // -------------------------------------------------------------------------------------
    // @ Alert
    // -------------------------------------------------------------------------------------
    alert = signal<{ type: FuseAlertType; message: string }>({
        type: 'success',
        message: '',
    });
    showAlert = signal<boolean>(false);

    constructor(public moviesComponent: MoviesComponent) {
        super(moviesComponent);
        effect(() => {
            if (this.movie() && this.movieFromComponent()) {
                const user = this.movie();
                this.movieFromComponent().movieForm.patchValue({
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    status: user.status,
                });

                this.movieFromComponent().movieForm.markAsPristine();
            }
        });
    }

    submit() {
        const form = this.movieFromComponent().movieForm;
        this.showAlert.set(false);
        form.disable();
        form.markAsPristine();
        if (form.invalid) {
            return;
        }

        // const value = environment.production
        //     ? form.value
        //     : this.mapFormValueToMovie(form.value);

        this._api.editMovie(this.movie().id, form.value).subscribe({
            next: (res) => {
                form.enable();
                this.showAlert.set(true);
                this.alert.set({
                    type: 'success',
                    message: res.message,
                });
            },
            error: (err: HttpErrorResponse) => {
                form.enable();
                this.showAlert.set(true);
                this.alert.set({
                    type: 'error',
                    message: Object.values(err?.error?.errors)
                        ?.map((msg) => '- ' + msg)
                        ?.join('<br>'),
                });
            },
        });
    }

    private mapFormValueToMovie(value: MovieFormValue): Movie {
        return {
            ...this.movie(),

            name: value.name,
            email: value.email,
            status: value.status,
            role: value.role,
        };
    }

    canDeactivateFn(): Observable<boolean> {
        const form = this.movieFromComponent().movieForm;
        if (form.dirty) {
            const confirmation = this._fuseConfirmationDialog.open({
                title: 'Discard changes?',
                message: 'All changes that have been made will be lost!',
                actions: {
                    confirm: {
                        label: 'Discard',
                        color: 'warn',
                    },
                    cancel: {
                        label: 'Cancel',
                    },
                },
            });
            return confirmation.afterClosed().pipe(
                map((res) => {
                    return res === 'confirmed';
                })
            );
        }
        return of(true);
    }
}
