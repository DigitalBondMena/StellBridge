import { CommonModule } from '@angular/common';
import { Component, computed, input, output, signal } from '@angular/core';

@Component({
  selector: 'app-client-pagination',
  imports: [CommonModule],
  templateUrl: './client-pagination.component.html',
  styleUrl: './client-pagination.component.css'
})
export class ClientPaginationComponent {
  totalItems = input<number>(0);      
  itemsPerPage = input<number>(5);     
  currentPage = input<number>(1);      
  pageChange = output<number>();
  totalPages = computed(()=>Math.ceil(this.totalItems() / this.itemsPerPage()))
  
  
  pages = computed(()=>Array.from({ length: this.totalPages() }, (_, i) => i + 1))

  changePage(page: number) {
    if (page < 1 || page > this.totalPages()) return;
    this.pageChange.emit(page); 
  }
}
