import { Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';

import { LandingSectionComponent } from "../home/components/landing-section/landing-section.component";
import { CareerService } from './res/career.service';
import { SharedCareerComponent } from "../../shared/components/shared-career/shared-career.component";
import { ClientPaginationComponent } from "../../shared/components/client-pagination/client-pagination.component";
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-career',
  imports: [LandingSectionComponent, SharedCareerComponent, ClientPaginationComponent],
  templateUrl: './career.component.html',
  styleUrl: './career.component.css'
})
export class CareerComponent implements OnInit,OnDestroy {
private readonly careerService = inject(CareerService);
private readonly destroy$ = new Subject<void>();
allCareers = signal<any>(null);
  ngOnInit() {
    this.getCareerData();
  }

  getCareerData():void {
    this.careerService.getCareerData().pipe(takeUntil(this.destroy$)).subscribe({
      next:(res)=>{
        const data = res.date.map((item: any) => item.jops).flat();
        this.allCareers.set([...data]);
        this.updatePage();
      },
      error:(err)=>{
    console.error(err);
  }
    },
  )
  }
itemsPerPage = 10;
currentPage = signal<number>(1);
paginatedData = signal<string[]>([]);

onPageChange(page: number) {
  this.currentPage.set(page);
  this.updatePage();
}

updatePage() {
  const start = (this.currentPage() - 1) * this.itemsPerPage;
  const end = start + this.itemsPerPage;
  this.paginatedData.set(this.allCareers().slice(start, end));  
}
ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete()
}
}
