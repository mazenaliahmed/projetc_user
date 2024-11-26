import { CommonModule, NgTemplateOutlet } from '@angular/common';
import { AfterViewInit, Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BaseTableComponent } from 'core/components/base-table/base-table.component';
import { MoviesDataSource } from 'core/models/movie.model';

@Component({
    selector: 'app-movies-table',
    standalone: true,
    imports: [
        MatTableModule,
        MatIconModule,
        CommonModule,
        MatPaginatorModule,
        MatFormFieldModule,
        MatInputModule,
        MatSortModule,
        MatCheckboxModule,
        NgTemplateOutlet,
        MatTooltipModule,
        MatButtonModule,
    ],

    templateUrl: './movies-table.component.html',
    styleUrl: './movies-table.component.scss',
})
export class MoviesTableComponent
    extends BaseTableComponent<MoviesDataSource>
    implements AfterViewInit {}
