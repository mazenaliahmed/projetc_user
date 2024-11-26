import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-breadcrumbs',
    standalone: true,
    imports: [MatIconModule, RouterLink, NgClass],
    templateUrl: './breadcrumbs.component.html',
    styleUrl: './breadcrumbs.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BreadcrumbsComponent {
    breadcrumbs = input.required<string[]>();
}
