import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    effect,
    inject,
    input,
    signal,
    viewChild,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import {
    MatError,
    MatFormFieldModule,
    MatHint,
} from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { fuseAnimations } from '@fuse/animations';
import { FuseAlertComponent, FuseAlertType } from '@fuse/components/alert';
import { MoviesApiService } from 'app/api/movies/movies-api.service';
import { Status, role } from 'app/mock-api/movies/data';
import { MovieFormValue } from 'core/models/movie.model';
import { UnsubscribeAll } from 'core/shared/unsubscribe';

@Component({
    selector: 'movie-form',
    standalone: true,
    imports: [
        ReactiveFormsModule,
        MatFormFieldModule,
        MatHint,
        MatError,
        MatInput,
        MatIcon,
        MatDatepickerModule,
        MatSelectModule,
        FuseAlertComponent,
    ],
    templateUrl: './movie-form.component.html',
    styleUrl: './movie-form.component.scss',
    animations: fuseAnimations,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MovieFormComponent extends UnsubscribeAll {
    private _moviesService = inject(MoviesApiService);
    private _formBuilder = inject(FormBuilder);

    status = signal(Status);

    // -------------------------------------------------------------------------------------
    // @ Form Group
    // -------------------------------------------------------------------------------------
    movieForm = this._formBuilder.group({
        name: ['', [Validators.required]],
        released_at: [0, [Validators.required]],
        email: ['', [Validators.required]],
        role: ['', [Validators.required]],
        status: ['', [Validators.required]],
    });

    // -------------------------------------------------------------------------------------
    // @ Dropdown items fetched from the API
    // -------------------------------------------------------------------------------------

    // -------------------------------------------------------------------------------------
    // @ Prevent rendering all dropdown items at once by paginating them in chunks
    // -------------------------------------------------------------------------------------
    // readonly paginatedDirectors = computed(() => _.chunk(this.directors(), 20));
    // readonly paginatedCastMembers = computed(() =>
    //     _.chunk(this.castMembers(), 20)
    // );
    // readonly paginatedGenres = computed(() => _.chunk(this.genres(), 20));
    // readonly paginatedDomains = computed(() => _.chunk(this.domains(), 20));
    // readonly paginatedLanguages = computed(() => _.chunk(this.languages(), 20));

    // -------------------------------------------------------------------------------------
    // @ Names of selected items to display in the dropdown label
    // -------------------------------------------------------------------------------------
    readonly selectedRole = signal<string[]>([]);
    readonly selectedCastMembers = signal<string[]>([]);
    readonly selectedDomains = signal<string[]>([]);
    readonly selectedGenres = signal<string[]>([]);
    readonly selectedLanguages = signal<string[]>([]);

    // -------------------------------------------------------------------------------------
    // @ Alert to display success or error messages after form submission
    // -------------------------------------------------------------------------------------
    alert = input<{ type: FuseAlertType; message: string }>({
        type: 'success',
        message: '',
    });
    showAlert = input<boolean>(false);
    formEl = viewChild.required<ElementRef<HTMLElement>>('formEl');
    role = signal(role);
    // -------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -------------------------------------------------------------------------------------
    constructor(private cdr: ChangeDetectorRef) {
        super();

        effect(() => {
            this.cdr.markForCheck();
            if (this.showAlert() && this.formEl().nativeElement) {
                this.cdr.detectChanges();
                this.formEl().nativeElement.parentElement.scrollTo(0, 0);
            }
        });
    }

    ngOnInit(): void {
        this.movieForm.markAsPristine();
    }

    // -------------------------------------------------------------------------------------
    // @ Methods
    // -------------------------------------------------------------------------------------
    /**
     * Get the names of the selected items instead of their ids to display in the dropdown label
     */

    // this.control('domains).valueChanges.pipe(takeUntil(this._destroyed$)).subscribe({
    //     next: (value) =>
    //         this.getNamesInsteadOfIds(
    //             value,
    //             this.domains(),
    //             'domain_name',
    //             this.selectedDomains
    //         ),
    // });

    control(fieldName: keyof MovieFormValue) {
        return this.movieForm.controls[fieldName];
    }
}
