import { Component, inject, signal } from '@angular/core';
import {
  PaginationComponent,
  PaginationLink,
} from '../../shared/components/pagination/pagination.component';
import { SharedServiceCardComponent } from '../../shared/components/shared-service-card/shared-service-card.component';
import { LandingSectionComponent } from '../home/components/landing-section/landing-section.component';
import { IMAGE_BASE_URL } from './../../core/env';
import { serviceData } from './res/services';
import { ServicesService } from './res/services.service';

@Component({
  selector: 'app-services',
  imports: [
    LandingSectionComponent,
    SharedServiceCardComponent,
    PaginationComponent,
  ],
  templateUrl: './services.component.html',
  styleUrl: './services.component.css',
})
export class ServicesComponent {
  services = signal<serviceData[]>([]);
  alternateServices = signal<serviceData[]>([]);
  links = signal<PaginationLink[]>([]);
  currentPage = signal<number>(1);
  lastPage = signal<number>(1);

  IMAGE_BASE_URL: string = IMAGE_BASE_URL;
  private servicesService = inject(ServicesService);

  ngOnInit(): void {
    this.getServicesData();
  }

  getServicesData(page: number = 1): void {
    this.servicesService.getServicesData(page).subscribe((data) => {
      data.services.data.map((service) => {
        service.id = service.id;
        service.title = service.title;
        service.small_text = service.small_text;
        service.main_image = this.IMAGE_BASE_URL + service.main_image;
        service.alt_image = this.IMAGE_BASE_URL + service.alt_image;
        service.active_status = service.active_status;
        service.slug = service.slug;
      });
      this.services.set(data.services.data);
      this.links.set(data.services.links as PaginationLink[]);
      this.currentPage.set(data.services.current_page);
      this.lastPage.set(data.services.last_page);
    });
  }

  onPageChange(page: number): void {
    this.getServicesData(page);
  }
}
