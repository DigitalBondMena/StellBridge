
import { IMAGE_BASE_URL } from './../../core/env';
import { Component, inject, signal } from '@angular/core';
import { SharedServiceCardComponent } from '../../shared/components/shared-service-card/shared-service-card.component';
import { LandingSectionComponent } from '../home/components/landing-section/landing-section.component';
import { Service } from '../home/res/home';
import { ServicesService } from './res/services.service';

@Component({
  selector: 'app-services',
  imports: [LandingSectionComponent, SharedServiceCardComponent],
  templateUrl: './services.component.html',
  styleUrl: './services.component.css',
})
export class ServicesComponent {

  services = signal<Service[]>([]);
  alternateServices = signal<Service[]>([]);

IMAGE_BASE_URL :string = IMAGE_BASE_URL;
  ngOnInit(): void {
    this.getServicesData();
  }
  private servicesService = inject(ServicesService);

  getServicesData(): void {
    this.servicesService.getServicesData().subscribe((data) => {
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
      console.log(this.services());
    });
  }
}
