import { Component, inject, signal } from '@angular/core';
import { IMAGE_BASE_URL } from '../../core/env';
import { ActivatedRoute } from '@angular/router';
import { SafeHtmlPipe } from '../../core/pipes/safe-html.pipe';
import { LandingSectionComponent } from '../home/components/landing-section/landing-section.component';
import { CareerService } from '../career/res/career.service';
import { CareerFormComponent } from "./components/career-form/career-form.component";
export interface ICareer {
  id: number
  jop_category_id: number
  en_main_title: string
  en_slug: string
  experience: string
  en_main_description: string
  active_status: number
  created_at: string
  updated_at: string
  sections: Section[]
}

export interface Section {
  id: number
  jop_information_id: number
  main_title: string
  main_description: string
}
@Component({
  selector: 'app-career-details',
  imports: [LandingSectionComponent, SafeHtmlPipe, CareerFormComponent],
  templateUrl: './career-details.component.html',
  styleUrl: './career-details.component.css'
})
export class CareerDetailsComponent {
  private activatedRoute = inject(ActivatedRoute);
  private careerSlug = signal<string | null>(null);
  careerDetails = signal<ICareer | null>(null);
  private careerService = inject(CareerService);

  IMAGE_BASE_URL: string = IMAGE_BASE_URL;

  ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe((next: any) => {
      this.careerSlug.set(next.get('slug'));
      console.log(this.careerSlug());
      this.fetchServiceData();

    });
  }

  private fetchServiceData(): void {
    if (this.careerSlug()) {
      this.careerService
        .getCareerDetailsData(this.careerSlug() as string)
        .subscribe({
          next: (response) => {
            if (response) {
              console.log(response);
              this.careerDetails.set(response.date);
            }
          },
          error: (error) => {
            console.error('Error fetching project data:', error);
          },
        });
    }
  }
}
