import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { SafeHtmlPipe } from '../../core/pipes/safe-html.pipe';
import { ClientsComponent } from '../home/components/clients/clients.component';
import { LandingSectionComponent } from '../home/components/landing-section/landing-section.component';
import { IMAGE_BASE_URL } from './../../core/env';
import { IAbout } from './res/about';
import { AboutService } from './res/about.service';
@Component({
  selector: 'app-about',
  standalone: true,
  imports: [
    CommonModule,
    ClientsComponent,
    LandingSectionComponent,
    SafeHtmlPipe,
  ],
  templateUrl: './about.component.html',
  styleUrl: './about.component.css',
})
export class AboutComponent implements OnInit {
  aboutData = signal<IAbout>({} as IAbout);
  private aboutService = inject(AboutService);
  IMAGE_BASE_URL = IMAGE_BASE_URL;
  ngOnInit(): void {
    this.aboutService.getAboutData().subscribe((data) => {
      this.aboutData.set(data);
    });
  }
}
