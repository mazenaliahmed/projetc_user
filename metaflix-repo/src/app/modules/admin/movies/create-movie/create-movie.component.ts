import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal, viewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { FuseAlertType } from '@fuse/components/alert';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { MoviesApiService } from 'app/api/movies/movies-api.service';
import { DrawerContent } from 'core/shared/drawer.content';
import { Observable, map, of } from 'rxjs';
import { MovieFormComponent } from '../_shared/movie-form/movie-form.component';
import { MoviesComponent } from '../movies.component';

@Component({
    selector: 'app-edit-movie',
    standalone: true,
    imports: [MatIconModule, RouterLink, MovieFormComponent, MatButtonModule],
    templateUrl: './create-movie.component.html',
    styleUrl: './create-movie.component.scss',
})
export class CreateMovieComponent extends DrawerContent {
    movieFromComponent = viewChild<MovieFormComponent>('movieForm');
    _api = inject(MoviesApiService);
    _fuseConfirmationDialog = inject(FuseConfirmationService);

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
    }

    submit() {
        const form = this.movieFromComponent().movieForm;
        this.showAlert.set(false);
        form.disable();
        form.markAsPristine();
        if (form.invalid) {
            return;
        }
        form.markAsPristine();
        this._api.createMovie(form.value).subscribe({
            next: (res) => {
                this.showAlert.set(true);
                this.alert.set({
                    type: 'success',
                    message: res.message,
                });
                form.reset();
                form.enable();
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
