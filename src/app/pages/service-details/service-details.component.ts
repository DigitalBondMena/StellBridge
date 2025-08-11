import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SafeHtmlPipe } from '../../core/pipes/safe-html.pipe';
import { LandingSectionComponent } from '../home/components/landing-section/landing-section.component';
import { singleService } from '../services/res/services';
import { ServicesService } from '../services/res/services.service';
import { IMAGE_BASE_URL } from './../../core/env';
@Component({
  selector: 'app-service-details',
  imports: [LandingSectionComponent, SafeHtmlPipe],
  templateUrl: './service-details.component.html',
  styleUrl: './service-details.component.css',
})
export class ServiceDetailsComponent {
  private activatedRoute = inject(ActivatedRoute);
  private projectId = signal<string | null>(null);
  serviceDetails = signal<singleService | null>(null);
  private servicesService = inject(ServicesService);

  IMAGE_BASE_URL: string = IMAGE_BASE_URL;

  ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe((next: any) => {
      this.projectId.set(next.get('slug'));
      console.log(this.projectId());
      this.fetchServiceData();
    });
  }

  private fetchServiceData(): void {
    if (this.projectId()) {
      this.servicesService
        .getServiceDetails(this.projectId() as string)
        .subscribe({
          next: (response) => {
            if (response) {
              console.log(response);
              this.serviceDetails.set(response.service);
            }
          },
          error: (error) => {
            console.error('Error fetching project data:', error);
          },
        });
    }
  }
}
