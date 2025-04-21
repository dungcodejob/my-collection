import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
    selector: 'app-bookmark-feature-list',
    standalone: true,
    imports: [
        CommonModule,
    ],
    templateUrl: './bookmark-list.component.html',
    styleUrl: './bookmark-list.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookmarkListComponent { }
