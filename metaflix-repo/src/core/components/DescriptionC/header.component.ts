import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { BreadcrumbsComponent } from '../breadcrumbs/breadcrumbs.component';

@Component({
    selector: 'app-header',
    standalone: true,
    imports: [MatIconModule, MatIconButton, RouterLink, BreadcrumbsComponent],
    templateUrl: './header.component.html',
    styleUrl: './header.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
    pageTitle = input.required<string>();
    breadcrumbs = input.required<string[]>();
}
