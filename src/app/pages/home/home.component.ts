import { Component, inject, OnInit, signal } from '@angular/core';
import { TtScrollingTextCrossedComponent } from '../../shared/components/tt-scrolling-text-crossed/tt-scrolling-text-crossed.component';
import { Contact } from '../contact-us/res/contact-us';
import { ContactUsService } from '../contact-us/res/contact-us.service';
import { AboutCeoComponent } from './components/about-ceo/about-ceo.component';
import { AboutSbcComponent } from './components/about-sbc/about-sbc.component';
import { ClientsComponent } from './components/clients/clients.component';
import { ContactComponent } from './components/contact/contact.component';
import { HeroComponent } from './components/hero/hero.component';
import { ProjectsComponent } from './components/projects/projects.component';
import { ServicesComponent } from './components/services/services.component';
import { TestimonialsComponent } from './components/testimonials/testimonials.component';
import {
  AboutHome,
  Client,
  Project,
  Service,
  Slider,
  Testimonial,
} from './res/home';
import { HomeService } from './res/home.service';
import { isFoundingDay } from '../../core/env';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    HeroComponent,
    AboutCeoComponent,
    AboutSbcComponent,
    ServicesComponent,
    ProjectsComponent,
    TestimonialsComponent,
    ClientsComponent,
    ContactComponent,
    TtScrollingTextCrossedComponent,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit {
  homeService = inject(HomeService);
  isFoundingDay = isFoundingDay;
  contactService = inject(ContactUsService);

  slider = signal<Slider>({} as Slider);
  aboutHome = signal<AboutHome>({} as AboutHome);
  clients = signal<Client[]>([]);
  services = signal<Service[]>([]);
  projects = signal<Project[]>([]);
  testimonials = signal<Testimonial[]>([]);
  contactUs = signal<Contact>({} as Contact);

  ngOnInit() {
    this.homeService.getHomeData().subscribe((data) => {
      this.slider.set(data.slider);
      this.aboutHome.set(data.aboutHome);
      this.clients.set(data.clients);
      this.services.set(data.services);
      this.projects.set(data.projects);
      this.testimonials.set(data.testimonials);
    });

    this.contactService.getContactUs().subscribe((data) => {
      this.contactUs.set(data.contact);
    });
  }
}
