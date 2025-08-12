import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

// Generic Link interface that works with both services and achievements
export interface PaginationLink {
  url: string | null | undefined;
  label: string;
  active: boolean;
}

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pagination.component.html',
})
export class PaginationComponent {
  @Input() links: PaginationLink[] = [];
  @Input() currentPage: number = 1;
  @Input() lastPage: number = 1;
  @Output() pageChange = new EventEmitter<number>();

  changePage(url: string | null | undefined, pageNumber?: number): void {
    // If direct page number is provided, use it
    if (pageNumber !== undefined) {
      // Validate page number is within bounds
      if (pageNumber >= 1 && pageNumber <= this.lastPage) {
        this.pageChange.emit(pageNumber);
      }
      return;
    }

    // If no URL is provided, do nothing
    if (!url) return;

    // Extract page number from URL
    try {
      const urlObj = new URL(url);
      const page = urlObj.searchParams.get('page');
      if (page) {
        const pageNum = parseInt(page, 10);
        this.pageChange.emit(pageNum);
      }
    } catch (error) {
      console.error('Invalid URL format:', error);
    }
  }

  onButtonHover(event: MouseEvent, isHover: boolean): void {
    const button = event.currentTarget as HTMLButtonElement;
    if (!button) return;

    if (isHover) {
      button.style.backgroundColor = '#F3F4F6';
      button.style.color = '#374151';
    } else {
      button.style.backgroundColor = 'white';
      button.style.color = '#4B5563';
    }
  }
}
